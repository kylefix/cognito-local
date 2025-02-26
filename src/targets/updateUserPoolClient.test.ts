import { ClockFake } from "../__tests__/clockFake";
import { newMockCognitoService } from "../__tests__/mockCognitoService";
import { newMockUserPoolService } from "../__tests__/mockUserPoolService";
import { TestContext } from "../__tests__/testContext";
import * as TDB from "../__tests__/testDataBuilder";
import { ResourceNotFoundError } from "../errors";
import { CognitoService, UserPoolService } from "../services";
import {
  UpdateUserPoolClient,
  UpdateUserPoolClientTarget,
} from "./updateUserPoolClient";

const originalDate = new Date();

describe("UpdateUserPoolClient target", () => {
  let updateUserPoolClient: UpdateUserPoolClientTarget;
  let mockCognitoService: jest.Mocked<CognitoService>;
  let mockUserPoolService: jest.Mocked<UserPoolService>;
  let clock: ClockFake;

  beforeEach(() => {
    mockUserPoolService = newMockUserPoolService();
    mockCognitoService = newMockCognitoService(mockUserPoolService);
    clock = new ClockFake(originalDate);

    updateUserPoolClient = UpdateUserPoolClient({
      clock,
      cognito: mockCognitoService,
    });
  });

  it("updates a user pool client", async () => {
    const existingAppClient = TDB.appClient({
      UserPoolId: "test",
    });

    mockCognitoService.getAppClient.mockResolvedValue(existingAppClient);

    const newDate = new Date();
    clock.advanceTo(new Date());

    const result = await updateUserPoolClient(TestContext, {
      ClientId: existingAppClient.ClientId,
      UserPoolId: existingAppClient.UserPoolId,
      ClientName: "new client name",
      AccessTokenValidity: 50,
    });

    expect(mockCognitoService.getAppClient).toHaveBeenCalledWith(
      TestContext,
      existingAppClient.ClientId
    );

    expect(mockUserPoolService.saveAppClient).toHaveBeenCalledWith(
      TestContext,
      {
        ...existingAppClient,
        AccessTokenValidity: 50,
        ClientName: "new client name",
        LastModifiedDate: newDate,
      }
    );

    expect(result.UserPoolClient).toEqual({
      ...existingAppClient,
      AccessTokenValidity: 50,
      ClientName: "new client name",
      LastModifiedDate: newDate,
    });
  });

  it("throws if the user pool client doesn't exist", async () => {
    mockCognitoService.getAppClient.mockResolvedValue(null);

    await expect(
      updateUserPoolClient(TestContext, {
        ClientId: "clientId",
        UserPoolId: "test",
      })
    ).rejects.toEqual(new ResourceNotFoundError());
  });
});
