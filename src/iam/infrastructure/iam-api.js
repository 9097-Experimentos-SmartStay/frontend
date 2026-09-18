import {BaseEndpoint} from "../../shared/infrastructure/services/base-endpoint.js";
import {BaseApi} from "../../shared/infrastructure/services/base-api.js";
import { endpoints } from "@/shared/infrastructure/config/api-config.js";
const signInEndpointPath = endpoints.signIn;
const signUpEndpointPath = endpoints.signUp;
const usersEndpointPath = endpoints.users;

/**
 * @class IamApi
 * @extends BaseApi
 * @summary API class for Identity and Access Management operations.
 */
export class IamApi extends BaseApi {
    #signInEndpoint;
    #signUpEndpoint;
    #usersEndpoint;

    /**
     * @constructor
     */
    constructor() {
        super();
        this.#signInEndpoint = new BaseEndpoint(this, signInEndpointPath);
        this.#signUpEndpoint = new BaseEndpoint(this, signUpEndpointPath);
        this.#usersEndpoint = new BaseEndpoint(this, usersEndpointPath);
    }

    /**
     * @param {Object} signInRequest - The sign-in request data.
     * @returns {Promise} A promise that resolves with the sign-in response.
     */
    signIn(signInRequest) {
        return this.#signInEndpoint.create(signInRequest);
    }

    /**
     * @param {Object} signUpRequest - The sign-up request data.
     * @returns {Promise} A promise that resolves with the sign-up response.
     */
    signUp(signUpRequest) {
        const requestData = {
            username: signUpRequest.username || signUpRequest.email,
            password: signUpRequest.password,
            role: signUpRequest.role,
            roles: [signUpRequest.role]
        };

        // Include name when available
        if (signUpRequest.name) {
            requestData.name = signUpRequest.name;
        }

        return this.#signUpEndpoint.create(requestData);
    }

    /**
     * @returns {Promise} A promise that resolves with the list of users.
     */
    getUsers() {
        return this.#usersEndpoint.getAll();
    }
}
