import type { MockMethod } from "vite-plugin-mock";
import Mock from "mockjs";

let walletBalance = 2688.5;

const formatMoney = (value: number) => Number(value.toFixed(2));

export default [
  {
    url: "/api/user/info",
    method: "get",
    response: () => {
      return {
        code: 200,
        message: "ok",
        data: {
          uid: Mock.Random.id(),
          name: Mock.Random.cname(),
          avatar: Mock.Random.image("100x100", "#50B347", "#FFF", "Vue3"),
          "roles|1": [["ADMIN"], ["STAFF"]],
        },
      };
    },
  },
  {
    url: "/api/user/login",
    method: "post",
    timeout: 1000,
    response: ({ body }: { body: { username: string; password: string } }) => {
      const { username, password } = body;

      if (username === "admin" && password === "123456") {
        return {
          code: 200,
          message: "登录成功",
          data: {
            token: "mock-token-xyz123456789",
          },
        };
      }
      return {
        code: 400,
        message: "用户名或密码错误",
        data: null,
      };
    },
  },
  {
    url: "/api/capital/wallet/:tenantId/balance",
    method: "get",
    timeout: 300,
    response: ({ query }: { query: { tenantId: string } }) => {
      return {
        code: 200,
        message: "ok",
        data: {
          tenantId: query.tenantId,
          balance: formatMoney(walletBalance),
          availableBalance: formatMoney(walletBalance),
          frozenAmount: 0,
          currency: "CNY",
          updatedAt: Mock.Random.now("yyyy-MM-dd HH:mm:ss"),
        },
      };
    },
  },
  {
    url: "/api/capital/wallet/recharge",
    method: "post",
    timeout: 600,
    response: ({ body }: { body: { tenantId?: string; amount?: number } }) => {
      const amount = Number(body.amount);

      if (!Number.isFinite(amount) || amount <= 0) {
        return {
          code: 400,
          message: "充值金额不正确",
          data: null,
        };
      }

      walletBalance = formatMoney(walletBalance + amount);

      return {
        code: 200,
        message: "充值成功",
        data: {
          orderNo: `RC${Mock.Random.now("yyyyMMddHHmmss")}${Mock.Random.string("number", 6)}`,
          tenantId: body.tenantId ?? "demo-tenant",
          amount: formatMoney(amount),
          balance: formatMoney(walletBalance),
          paidAt: Mock.Random.now("yyyy-MM-dd HH:mm:ss"),
          status: "success",
        },
      };
    },
  },
  {
    url: "/order/list",
    method: "post",
    timeout: 1000,
    response: ({ body }: { body: { pageSize: string; pageNo: string } }) => {
      const pageSize = Number(body.pageSize || 10);
      const pageNo = Number(body.pageNo || 1);

      return {
        code: 200,
        message: "ok",
        data: {
          pageSize,
          pageNo,
          total: 0,
          list: [],
        },
      };
    },
  },
] as MockMethod[];
