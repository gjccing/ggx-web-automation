export type CouponAppliedToastWatch = {
  appeared: () => boolean;
  text: () => string | undefined;
};

export const bet4451Context: {
  voucherCode?: string;
  voucherTitle?: string;
  couponAppliedToastWatch?: CouponAppliedToastWatch;
} = {};

export function resetBet4451Context(): void {
  bet4451Context.voucherCode = undefined;
  bet4451Context.voucherTitle = undefined;
  bet4451Context.couponAppliedToastWatch = undefined;
}
