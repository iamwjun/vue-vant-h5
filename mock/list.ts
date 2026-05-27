import Mock from "mockjs";

const BILL_MONTH_COUNT = 3;
const BILL_COUNT_PER_MONTH = 36;

const billScenes = [
  {
    type: "recharge",
    typeName: "余额充值",
    direction: "income",
    titles: ["账户充值", "储值卡充值", "运营充值"],
    channels: ["微信支付", "支付宝", "银行卡"],
  },
  {
    type: "consume",
    typeName: "余额消费",
    direction: "expense",
    titles: ["订单扣款", "套餐购买", "门店消费"],
    channels: ["余额支付"],
  },
  {
    type: "renewal",
    typeName: "续费扣款",
    direction: "expense",
    titles: ["门店续费", "服务续费", "会员续费"],
    channels: ["余额支付"],
  },
  {
    type: "refund",
    typeName: "订单退款",
    direction: "income",
    titles: ["订单退款", "服务退款", "差额退回"],
    channels: ["原路退回", "余额入账"],
  },
  {
    type: "adjustment",
    typeName: "人工调账",
    direction: "income",
    titles: ["人工补款", "活动补贴", "系统调账"],
    channels: ["系统调整"],
  },
] as const;

const billStatuses = [
  { status: "success", statusName: "已完成" },
  { status: "processing", statusName: "处理中" },
  { status: "failed", statusName: "失败" },
] as const;

type BillScene = (typeof billScenes)[number];
type BillStatus = (typeof billStatuses)[number];
type BillDirection = BillScene["direction"];

interface Bill {
  id: string;
  billNo: string;
  month: string;
  date: string;
  time: string;
  createdAt: string;
  title: string;
  type: BillScene["type"];
  typeName: BillScene["typeName"];
  direction: BillDirection;
  amount: number;
  amountText: string;
  balanceAfter: number;
  channel: BillScene["channels"][number];
  status: BillStatus["status"];
  statusName: BillStatus["statusName"];
  storeName: string;
  operator: string;
  remark: string;
}

interface BillGroup {
  month: string;
  monthName: string;
  total: number;
  incomeTotal: number;
  expenseTotal: number;
  list: Bill[];
}

const formatMoney = (value: number) => Number(value.toFixed(2));

const pickMockValue = <T>(items: readonly T[]) => Mock.Random.pick(items as unknown as T[]) as T;

const getRecentMonths = (count: number) => {
  const current = new Date();

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(current.getFullYear(), current.getMonth() - index, 1);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");

    return `${year}-${month}`;
  });
};

const getDaysInMonth = (month: string) => {
  const [year, monthValue] = month.split("-").map(Number);

  return new Date(year, monthValue, 0).getDate();
};

const createBillDate = (month: string) => {
  const day = `${Mock.Random.integer(1, getDaysInMonth(month))}`.padStart(2, "0");
  const hour = `${Mock.Random.integer(0, 23)}`.padStart(2, "0");
  const minute = `${Mock.Random.integer(0, 59)}`.padStart(2, "0");
  const second = `${Mock.Random.integer(0, 59)}`.padStart(2, "0");
  const date = `${month}-${day}`;
  const time = `${hour}:${minute}:${second}`;

  return {
    date,
    time,
    createdAt: `${date} ${time}`,
  };
};

const getBillAmount = (direction: BillDirection) => {
  const amount = Mock.Random.float(10, direction === "income" ? 8000 : 3000, 2, 2);

  return formatMoney(amount);
};

const getMonthName = (month: string) => {
  const [year, monthValue] = month.split("-");

  return `${year}年${monthValue}月`;
};

const getGroupTotal = (list: Bill[], direction: BillDirection) =>
  formatMoney(
    list.reduce((total, item) => {
      if (item.direction !== direction || item.status === "failed") {
        return total;
      }

      return total + item.amount;
    }, 0)
  );

const createBill = (month: string, index: number): Bill => {
  const scene = pickMockValue(billScenes);
  const status = pickMockValue(billStatuses);
  const amount = getBillAmount(scene.direction);
  const dateInfo = createBillDate(month);
  const amountPrefix = scene.direction === "income" ? "+" : "-";

  return Mock.mock({
    id: `bill_${month.replace("-", "")}_${`${index + 1}`.padStart(3, "0")}`,
    billNo: `BL${month.replace("-", "")}${`${index + 1}`.padStart(4, "0")}`,
    month,
    ...dateInfo,
    "title|1": scene.titles,
    type: scene.type,
    typeName: scene.typeName,
    direction: scene.direction,
    amount,
    amountText: `${amountPrefix}${amount.toFixed(2)}`,
    "balanceAfter|1000-100000.2": 1,
    "channel|1": scene.channels,
    status: status.status,
    statusName: status.statusName,
    storeName: "@ctitle(3, 6)门店",
    operator: "@cname",
    remark: "@csentence(8, 18)",
  });
};

const groups: BillGroup[] = getRecentMonths(BILL_MONTH_COUNT).map((month) => {
  const list = Mock.mock({
    [`list|${BILL_COUNT_PER_MONTH}`]: [
      {
        "index|+1": 0,
      },
    ],
  }).list
    .map(({ index }: { index: number }) => createBill(month, index))
    .sort((current: Bill, next: Bill) => next.createdAt.localeCompare(current.createdAt));

  return {
    month,
    monthName: getMonthName(month),
    total: list.length,
    incomeTotal: getGroupTotal(list, "income"),
    expenseTotal: getGroupTotal(list, "expense"),
    list,
  };
});

export const bills = {
  total: BILL_MONTH_COUNT * BILL_COUNT_PER_MONTH,
  months: groups.map((group) => group.month),
  list: groups.flatMap((group) => group.list),
  groups,
};
