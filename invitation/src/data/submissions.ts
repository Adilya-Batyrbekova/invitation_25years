// No backend is configured in this design draft. Never fabricate a successful save.
export async function submitDraft(): Promise<never> {
  await new Promise((resolve) => setTimeout(resolve, 450));
  throw new Error(
    "Не получилось отправить. Попробуй ещё раз чуть позже — всё написанное осталось на месте.",
  );
}
