const project = "https://moderation-fixture.invalid";
const owner = "00000000-0000-4000-8000-000000000071";
const ownId = "00000000-0000-4000-8000-000000000101";

export async function installModerationPreview(context) {
  let wishes = [
    { id: ownId, name: "Тестовая Аня", message: "Ура!" },
    {
      id: "00000000-0000-4000-8000-000000000102",
      name: "Тестовый Миша",
      message: "Пусть этот день будет тёплым и запомнится надолго.",
    },
    {
      id: "00000000-0000-4000-8000-000000000103",
      name: "Тестовая Маша",
      message:
        "Желаю побольше уютных вечеров, встреч с друзьями и времени на любимые занятия.",
    },
  ];
  let bookings = new Map([
    [2, false],
    [4, true],
  ]);
  await context.addInitScript(
    ({ owner }) => {
      if (location.hostname !== "127.0.0.1") return;
      const expires = Math.floor(Date.now() / 1000) + 3600;
      localStorage.setItem(
        "sb-moderation-fixture-auth-token",
        JSON.stringify({
          access_token: "synthetic-access",
          refresh_token: "synthetic-refresh",
          expires_at: expires,
          user: { id: owner, is_anonymous: true },
        }),
      );
    },
    { owner },
  );
  await context.route("**/src/data/guestResponses.ts*", async (route) => {
    const response = await route.fetch();
    const source = (await response.text())
      .replace(
        /const url = [^;]+;/,
        "const url = " + JSON.stringify(project) + ";",
      )
      .replace(
        /const key = [^;]+;/,
        'const key = "sb_publishable_moderation_fixture";',
      );
    await route.fulfill({ response, body: source });
  });
  await context.route(project + "/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const endpoint = url.pathname.split("/").at(-1);
    if (endpoint === "wishes") {
      if (request.method() === "GET") return route.fulfill({ json: wishes });
      const id = url.searchParams.get("id");
      if (id !== "eq." + ownId || !wishes.some((wish) => wish.id === ownId))
        return route.fulfill({ status: 403, json: { code: "42501" } });
      if (request.method() === "DELETE") {
        wishes = wishes.filter((wish) => wish.id !== ownId);
        return route.fulfill({ json: { id: ownId } });
      }
      if (request.method() === "PATCH") {
        wishes = wishes.map((wish) =>
          wish.id === ownId ? { ...wish, ...request.postDataJSON() } : wish,
        );
        return route.fulfill({ json: { id: ownId } });
      }
    }
    if (endpoint === "own_wish_ids") return route.fulfill({ json: [ownId] });
    if (endpoint === "invitation_gift_availability") {
      return route.fulfill({
        json: Array.from({ length: 6 }, (_, index) => {
          const id = index + 1;
          return {
            gift_id: id,
            bookable: true,
            reserved: bookings.has(id),
            own: bookings.get(id) === true,
          };
        }),
      });
    }
    if (
      endpoint === "reserve_invitation_gift" ||
      endpoint === "cancel_invitation_gift"
    ) {
      const { requested_id: id } = request.postDataJSON();
      if (endpoint === "reserve_invitation_gift" && !bookings.has(id)) {
        bookings.set(id, true);
        return route.fulfill({ json: true });
      }
      if (endpoint === "cancel_invitation_gift" && bookings.get(id) === true) {
        bookings.delete(id);
        return route.fulfill({ json: true });
      }
      return route.fulfill({ json: false });
    }
    await route.abort();
  });
}
