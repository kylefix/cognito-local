import { ClockFake } from "../__tests__/clockFake";
import { newMockCognitoService } from "../__tests__/mockCognitoService";
import { newMockUserPoolService } from "../__tests__/mockUserPoolService";
import { TestContext } from "../__tests__/testContext";
import { UserPoolService } from "../services";
import {
  CreateUserPoolClient,
  CreateUserPoolClientTarget,
} from "./createUserPoolClient";

const originalDate = new Date();

describe("CreateUserPoolClient target", () => {
  let createUserPoolClient: CreateUserPoolClientTarget;
  let mockUserPoolService: jest.Mocked<UserPoolService>;

  beforeEach(() => {
    mockUserPoolService = newMockUserPoolService();
    createUserPoolClient = CreateUserPoolClient({
      clock: new ClockFake(originalDate),
      cognito: newMockCognitoService(mockUserPoolService),
    });
  });

  it("creates a new app client", async () => {
    const result = await createUserPoolClient(TestContext, {
      ClientName: "clientName",
      UserPoolId: "userPoolId",
    });

    expect(mockUserPoolService.saveAppClient).toHaveBeenCalledWith(
      TestContext,
      {
        ClientId: expect.any(String),
        ClientName: "clientName",
        CreationDate: originalDate,
        LastModifiedDate: originalDate,
        UserPoolId: "userPoolId",
      }
    );

    expect(result).toEqual({
      UserPoolClient: {
        ClientId: expect.any(String),
        ClientName: "clientName",
        CreationDate: originalDate,
        LastModifiedDate: originalDate,
        UserPoolId: "userPoolId",
      },
    });
  });
});
