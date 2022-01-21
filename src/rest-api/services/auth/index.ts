import {preValidationHookHandler} from "fastify";
import {Service} from "typedi";
import UserModel from "../../../models/user";
import user, {IUser} from "../../../models/user";
import * as jose from 'jose'
import {KeyLike} from 'jose'
import {AppEnv} from "../../../services/env";
import {ServiceMethod} from "../index";
import {HydratedDocument} from "mongoose";
import {compareSync, genSaltSync, hashSync} from 'bcryptjs';
import {IHttpRegisterRequest} from "../../controllers/auth/bodies/register";
import {IHttpLoginRequest} from "../../controllers/auth/bodies/login";

interface ILoginResponse {
  user: HydratedDocument<IUser>,
  token: string
}

interface IRegisterResponse {
  user: HydratedDocument<IUser>,
}

interface IAuthService {
  login: ServiceMethod<IHttpLoginRequest, ILoginResponse>
}


@Service()
export class AuthService implements IAuthService {
  jwtPrivateKey: KeyLike;

  constructor(private appEnv: AppEnv) {
    this.loadKey();
  }

  async loadKey() {
    this.jwtPrivateKey = await jose.importJWK({
      kty: 'oct',
      k: this.appEnv.get('JWT_SECRET') as string
    }, 'HS256') as KeyLike;
  }

  login: ServiceMethod<IHttpLoginRequest, ILoginResponse> = async (authRequest) => {
    const databaseUser = await user.findOne({email: authRequest.email});
    if (!databaseUser) {
      throw new Error('Could not find the user');
    }

    // Check the user against the password saved in database
    if (!compareSync(authRequest.password, databaseUser.password)) {
      throw new Error('Invalid password');
    }


    return {
      user: databaseUser,
      token: await this.createUserToken(databaseUser),
    }
  }

  // Create a JWT Token, valid for two years, containing user's payload
  async createUserToken(user: HydratedDocument<IUser>): Promise<string> {
    const token = await new jose.SignJWT({
      _id: user._id,
      firstName: user.name,
      lastName: user.surname
    })
      .setProtectedHeader({alg: 'HS256'})
      .setIssuedAt()
      .setIssuer('urn:tpc:issuer')
      .setAudience('urn:tpc:audience')
      .setExpirationTime('2y')
      .sign(this.jwtPrivateKey);
    return token;
  }

  register: ServiceMethod<IHttpRegisterRequest, IRegisterResponse> = async (registerRequest) => {
    const databaseUser = await user.findOne({email: registerRequest.email});
    if (databaseUser) {
      throw new Error('An user already exists with this email');
    }

    const newUser = await user.create({
      ...registerRequest,
      password: undefined,
      vaccines: [],
      tests_results: []
    })

    const salt = genSaltSync(10);
    newUser.password = hashSync(registerRequest.password, salt);
    newUser.avatar = `https://avatars.dicebear.com/api/bottts/${newUser._id}.svg`
    await newUser.save();

    return {
      user: newUser,
      token: await this.createUserToken(newUser),
    }
  }

  authenticate: preValidationHookHandler = async (request, reply) => {
    const {headers} = request;

    // Safety checks to ensure headers are correct
    if (!headers && headers !== undefined) {
      reply.code(422).send({success: false, error: 'No headers'});
      return reply;
    }
    const authorizationHeader = headers['authorization'];
    if (!authorizationHeader) {
      reply.code(403).send({success: false, error: 'No authorization header'});
      return reply;
    }
    const [, token] = authorizationHeader.split(' ');
    if (!token) {
      reply.code(403).send({success: false, error: 'Malformed authorization header'});
      return reply;
    }

    let jwtVerifyResult: jose.JWTVerifyResult;
    try {
      jwtVerifyResult = await jose.jwtVerify(token, this.jwtPrivateKey, {
        issuer: 'urn:tpc:issuer',
        audience: 'urn:tpc:audience'
      })
    } catch (e) {
      reply.code(403).send({success: false, error: `JWT Decode failed ${e.message}`});
      return reply;
    }
    const user = await UserModel.findById(jwtVerifyResult.payload._id);
    if (!user) {
      reply.code(403).send({success: false, error: 'Could not find user'});
      return reply;
    }
    request.user = user;
    return user;
  }
}
