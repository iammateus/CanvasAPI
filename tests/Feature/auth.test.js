const request = require("supertest");
const { StatusCodes } = require("http-status-codes");
const app = require("../../index");
const { mockDatabase, unmockDatabase } = require("../_mocks/database.mock");
const database = require("../../app/database/database");
const jwt = require("../../app/helpers/jwt.helper");
const userMock = require("../_mocks/user.mock");
const faker = require("faker");

describe("/auth/login", () => {
    beforeAll(async () => {
        mockDatabase();
        await database.connect();
    });

    it("should exist", async () => {
        const response = await request(app).post("/auth/login");
        expect(response.status !== StatusCodes.NOT_FOUND).toBe(true);
    });

    it("should return ok status and token when user is authenticated successfully", async () => {
        const { user, password } = await userMock.create();
        const data = {
            email: user.email,
            password: password,
        };
        const response = await request(app).post("/auth/login").send(data);
        expect(response.status).toEqual(StatusCodes.OK);
        expect(response.body.message).toEqual(
            "User authenticated successfully"
        );
        const { token } = response.body.data;
        expect(jwt.check(token)).toBeTruthy();
    });

    it("should return token with user id when user is authenticated successfully", async () => {
        const { user, password } = await userMock.create();
        const data = {
            email: user.email,
            password: password,
        };
        const response = await request(app).post("/auth/login").send(data);
        const { token } = response.body.data;
        const decodedToken = jwt.check(token);

        expect(decodedToken.id).toBeTruthy();
        expect(String(decodedToken.id)).toEqual(String(user._id));
    });

    it("should return unprocessable entity when email is not informed", async () => {
        const response = await request(app).post("/auth/login");
        expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        expect(response.body).toMatchObject({
            message: '"email" is required',
            path: ["email"],
            type: "any.required",
            context: { label: "email", key: "email" },
        });
    });

    it("should return unprocessable entity when email is invalid", async () => {
        const data = {
            email: faker.lorem.word(),
        };
        const response = await request(app).post("/auth/login").send(data);
        expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        expect(response.body).toMatchObject({
            message: '"email" must be a valid email',
            path: ["email"],
            type: "string.email",
            context: { label: "email", key: "email" },
        });
    });

    it("should return unprocessable entity when password is not informed", async () => {
        const data = {
            email: faker.internet.email(),
        };
        const response = await request(app).post("/auth/login").send(data);
        expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        expect(response.body).toMatchObject({
            message: '"password" is required',
            path: ["password"],
            type: "any.required",
            context: { label: "password", key: "password" },
        });
    });

    it("should return unprocessable entity when password is too short", async () => {
        const data = {
            email: faker.internet.email(),
            password: faker.lorem.word(7),
        };
        const response = await request(app).post("/auth/login").send(data);
        expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        expect(response.body).toMatchObject({
            message: '"password" length must be at least 8 characters long',
            path: ["password"],
            type: "string.min",
            context: { label: "password", key: "password" },
        });
    });

    it("should return unprocessable entity when user email is invalid", async () => {
        const data = {
            email: faker.internet.email(),
            password: faker.lorem.word(8),
        };
        const response = await request(app).post("/auth/login").send(data);
        expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        expect(response.body).toMatchObject({
            message: "Email or password does not exist",
        });
    });

    it("should return unprocessable entity when user password is invalid", async () => {
        const { user } = await userMock.create();
        const data = {
            email: user.email,
            password: faker.lorem.word(9),
        };

        const response = await request(app).post("/auth/login").send(data);
        expect(response.status).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        expect(response.body).toMatchObject({
            message: "Email or password does not exist",
        });
    });

    afterAll(async () => {
        unmockDatabase();
        await database.disconnect();
    });
});
