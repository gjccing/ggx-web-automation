export const movingTestContext: {
  runId: string;
  orderId?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
} = {
  runId: "",
};

export function resetMovingTestContext(): void {
  const runId = `run-${Date.now()}`;
  movingTestContext.runId = runId;
  movingTestContext.orderId = undefined;
  movingTestContext.contactName = undefined;
  movingTestContext.contactPhone = undefined;
  movingTestContext.contactEmail = undefined;
}
