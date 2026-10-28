import type { Page } from "@playwright/test";

export const bet4485Context: {
  ordersPage?: Page;
  orderA?: string;
  orderC?: string;
  detailUrls: string[];
  listUrls: string[];
  detailCountAtConfirm: number;
  listCountAtConfirm: number;
} = {
  detailUrls: [],
  listUrls: [],
  detailCountAtConfirm: 0,
  listCountAtConfirm: 0,
};

export function resetBet4485Context(): void {
  bet4485Context.ordersPage = undefined;
  bet4485Context.orderA = undefined;
  bet4485Context.orderC = undefined;
  bet4485Context.detailUrls = [];
  bet4485Context.listUrls = [];
  bet4485Context.detailCountAtConfirm = 0;
  bet4485Context.listCountAtConfirm = 0;
}
