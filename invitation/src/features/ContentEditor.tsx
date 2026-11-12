import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import {
  loadLocalDraft,
  localEditorRequest,
  type EditorContent,
} from "../data/editorContent";
import { giftOwner, publishGifts } from "../data/giftPublication";
import { t } from "../lib/typography";
import type { IdeaItem } from "../data/ideasContent.mjs";
import { FormattedField } from "./FormattedField";

const sections = {
  personal: "Это всё я",
  ideas: "Что мне нравится",
  gifts: "Вишлист",
};

const publishMessage: Record<string, string> = {
  publishing: "Черновик сохранён. Публикуем на GitHub Pages…",
  live: "Изменения уже доступны на публичном сайте.",
  waiting:
    "Изменения отправлены на GitHub. Публичная версия пока не подтверждена.",
  failed: "Черновик сохранён. Публикация не подтвердилась. Можно повторить.",
  busy: "Черновик сохранён. Дождись текущей публикации и повтори отправку.",

  upgrade:
    "Черновик сохранён. Новые карточки доступны в предпросмотре. Для публикации нужно обновить гостевую страницу.",
};

function Text({
  label,
  value,
  change,
  long = false,
  formatted = false,
}: {
  label: string;
  value: string;
  change: (value: string) => void;
  long?: boolean;
  formatted?: boolean;
}) {
  if (formatted)
    return <FormattedField label={label} value={value} change={change} />;
  return (
    <label>
      {t(label)}
      {long ? (
        <textarea
          value={value}
          maxLength={4000}
          onChange={(e) => change(e.target.value)}
        />
      ) : (
        <input
          value={value}
          maxLength={300}
          onChange={(e) => change(e.target.value)}
        />
      )}
    </label>
  );
}

function Order({
  index,
  count,
  move,
  remove,
}: {
  index: number;
  count: number;
  move: (to: number) => void;
  remove: () => void;
}) {
  return (
    <div className="owner-order">
      <button
        type="button"
        disabled={index === 0}
        onClick={() => move(index - 1)}
      >
        {t("Выше")}
      </button>{" "}
      <button
        type="button"
        disabled={index === count - 1}
        onClick={() => move(index + 1)}
      >
        {t("Ниже")}
      </button>{" "}
      <button type="button" onClick={remove}>
        {t("Убрать")}
      </button>
    </div>
  );
}

function List<T>({
  items,
  change,
  create,
  render,
  title,
  label,
  columns = false,
  itemKey,
  addLabel,
  orderLabel,
}: {
  items: T[];
  change: (items: T[]) => void;
  create: () => T;
  render: (item: T, change: (item: T) => void) => React.ReactNode;
  label: string;
  title: (item: T) => string;
  columns?: boolean;
  itemKey?: (item: T) => string;
  addLabel?: string;
  orderLabel?: string;
}) {
  const group = useId();
  const [added, setAdded] = useState<number | string>();
  const addedRecord = useRef<HTMLDetailsElement>(null);
  const [target, setTarget] = useState<number>();
  function move(from: number, to: number) {
    if (from === to || to < 0 || to >= items.length) return;
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    change(next);
  }
  function dropIndex(x: number, y: number) {
    const value = document
      .elementFromPoint(x, y)
      ?.closest<HTMLElement>("[data-topic-index]")?.dataset.topicIndex;
    return value === undefined ? undefined : Number(value);
  }
  useLayoutEffect(() => {
    if (addedRecord.current) addedRecord.current.open = true;
  }, [added]);
  return (
    <div
      className={
        "owner-records" +
        (columns ? " owner-records-grid" : "") +
        (orderLabel ? " owner-topics" : "")
      }
    >
      {items.map((item, index) => (
        <details
          className="owner-record"
          key={itemKey?.(item) ?? index}
          name={orderLabel ? undefined : group}
          data-topic-index={orderLabel ? index : undefined}
          data-drop-target={orderLabel && target === index ? "" : undefined}
          ref={(itemKey?.(item) ?? index) === added ? addedRecord : undefined}
        >
          <summary>
            {orderLabel ? (
              <>
                <span className="owner-topic-title">
                  <small>{t(orderLabel + " " + (index + 1))}</small>
                  <span>{t(title(item) || "Без названия")}</span>
                </span>
                <button
                  type="button"
                  className="owner-topic-grip"
                  aria-label={t(
                    "Переместить карточку " + (title(item) || index + 1),
                  )}
                  title={t(
                    "Перетащи карточку или используй стрелки вверх и вниз",
                  )}
                  onClick={(event) => event.preventDefault()}
                  onKeyDown={(event) => {
                    if (event.key !== "ArrowUp" && event.key !== "ArrowDown")
                      return;
                    event.preventDefault();
                    const grip = event.currentTarget;
                    move(index, index + (event.key === "ArrowUp" ? -1 : 1));
                    requestAnimationFrame(() => grip.focus());
                  }}
                  onPointerDown={(event) => {
                    if (!event.isPrimary || event.button !== 0) return;
                    event.currentTarget.setPointerCapture(event.pointerId);
                  }}
                  onPointerMove={(event) => {
                    if (!event.currentTarget.hasPointerCapture(event.pointerId))
                      return;
                    const next = dropIndex(event.clientX, event.clientY);
                    setTarget(next === index ? undefined : next);
                  }}
                  onPointerUp={(event) => {
                    if (!event.currentTarget.hasPointerCapture(event.pointerId))
                      return;
                    const next = dropIndex(event.clientX, event.clientY);
                    if (next !== undefined) move(index, next);
                    setTarget(undefined);
                  }}
                  onLostPointerCapture={() => setTarget(undefined)}
                >
                  <span aria-hidden="true">⠿</span>
                </button>
              </>
            ) : (
              t(title(item) || label + " " + (index + 1))
            )}
          </summary>
          <div className="owner-record-fields">
            {render(item, (value) =>
              change(items.map((entry, i) => (i === index ? value : entry))),
            )}
            <Order
              index={index}
              count={items.length}
              remove={() => change(items.filter((_, i) => i !== index))}
              move={(to) => move(index, to)}
            />
          </div>
        </details>
      ))}
      <button
        type="button"
        disabled={items.length >= 30}
        onClick={() => {
          const item = create();
          setAdded(itemKey?.(item) ?? items.length);
          change([...items, item]);
        }}
      >
        {t(addLabel ?? "Добавить запись")}
      </button>
    </div>
  );
}

function PhotoCrop({
  image,
  square,
  busy,
  save,
  cancel,
}: {
  image: ImageBitmap;
  square: boolean;
  busy: boolean;
  save: (blob: Blob | null) => Promise<void>;
  cancel: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [cropSquare, setCropSquare] = useState(square);
  const [zoom, setZoom] = useState(1);
  const [x, setX] = useState(50);
  const [y, setY] = useState(50);
  const side = Math.min(image.width, image.height);
  const width = (cropSquare ? side : image.width) / zoom;
  const height = (cropSquare ? side : image.height) / zoom;
  const scale = Math.min(1, 1200 / Math.max(width, height));
  const outputWidth = Math.max(1, Math.round(width * scale));
  const outputHeight = Math.max(1, Math.round(height * scale));

  useEffect(() => {
    const context = canvas.current?.getContext("2d");
    context?.clearRect(0, 0, outputWidth, outputHeight);
    context?.drawImage(
      image,
      ((image.width - width) * x) / 100,
      ((image.height - height) * y) / 100,
      width,
      height,
      0,
      0,
      outputWidth,
      outputHeight,
    );
  }, [image, width, height, x, y, outputWidth, outputHeight]);

  return (
    <fieldset className="owner-crop">
      <legend>{t("Кадрирование фотографии")}</legend>
      <div className="owner-crop-layout">
        <div className="owner-crop-preview">
          <canvas
            ref={canvas}
            width={outputWidth}
            height={outputHeight}
            style={{
              display: "block",
              maxWidth: "100%",
              maxHeight: "280px",
              objectFit: "contain",
            }}
            aria-label={t("Предпросмотр кадра")}
            role="img"
          />
          <p>
            {t(
              "Файл для сайта: " +
                outputWidth +
                " × " +
                outputHeight +
                ", PNG без потерь.",
            )}
          </p>
        </div>
        <div className="owner-crop-controls">
          {!square && (
            <label className="owner-crop-square">
              <input
                type="checkbox"
                checked={cropSquare}
                onChange={(event) => setCropSquare(event.target.checked)}
              />
              {t("Квадратный кадр")}
            </label>
          )}
          <label>
            {t("Приближение")}
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
            />
          </label>
          <label>
            {t("Положение по горизонтали")}
            <input
              type="range"
              min={0}
              max={100}
              value={x}
              disabled={width === image.width}
              onChange={(event) => setX(Number(event.target.value))}
            />
          </label>
          <label>
            {t("Положение по вертикали")}
            <input
              type="range"
              min={0}
              max={100}
              value={y}
              disabled={height === image.height}
              onChange={(event) => setY(Number(event.target.value))}
            />
          </label>
          <div className="owner-crop-actions">
            <button
              className="button"
              type="button"
              disabled={busy}
              onClick={() => {
                canvas.current?.toBlob((blob) => void save(blob), "image/png");
              }}
            >
              {t("Применить кадр")}
            </button>
            <button
              className="button"
              type="button"
              disabled={busy}
              onClick={cancel}
            >
              {t("Отмена")}
            </button>
          </div>
        </div>
      </div>
    </fieldset>
  );
}

function Photos({
  photos,
  change,
  square = false,
  pending,
}: {
  photos: string[];
  change: (photos: string[]) => void;
  square?: boolean;
  pending: (value: boolean) => void;
}) {
  const [image, setImage] = useState<ImageBitmap>();
  const [saving, setSaving] = useState(false);
  useEffect(() => () => image?.close(), [image]);
  const [error, setError] = useState("");
  return (
    <fieldset>
      <legend>{t("Фотографии")}</legend>
      {photos.map((src, index) => (
        <div className="owner-photo-row" key={index}>
          <img
            src={src}
            width={48}
            height={48}
            alt={t("Фото " + (index + 1))}
          />
          <Order
            index={index}
            count={photos.length}
            remove={() => change(photos.filter((_, i) => i !== index))}
            move={(to) => {
              const next = [...photos];
              [next[index], next[to]] = [next[to], next[index]];
              change(next);
            }}
          />
        </div>
      ))}
      <label>
        {t("Загрузить фотографию")}
        <input
          type="file"
          accept="image/*"
          disabled={photos.length >= 5 || Boolean(image)}
          onChange={async (event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = "";
            if (!file) return;
            setError("");
            pending(true);
            try {
              if (file.size > 100 * 1024 * 1024) {
                setError(
                  "Файл больше 100 МБ. Выберите фотографию меньшего объёма.",
                );
                return;
              }
              setImage(await createImageBitmap(file));
            } catch {
              setError(
                "Браузер не смог открыть фотографию. Попробуйте JPEG, PNG или WebP.",
              );
            } finally {
              pending(false);
            }
          }}
        />
      </label>
      {image && (
        <PhotoCrop
          image={image}
          square={square}
          busy={saving}
          cancel={() => setImage(undefined)}
          save={async (blob) => {
            if (!blob) {
              setError("Не удалось подготовить PNG. Попробуйте ещё раз.");
              return;
            }
            setSaving(true);
            pending(true);
            try {
              const response = await localEditorRequest("/image", {
                method: "POST",
                body: blob,
              });
              const { path } = (await response.json()) as { path: string };
              change([...photos, path]);
              setImage(undefined);
              setError("");
            } catch {
              setError("Не удалось сохранить кадр. Попробуйте ещё раз.");
            } finally {
              setSaving(false);
              pending(false);
            }
          }}
        />
      )}
      {error && <p role="alert">{t(error)}</p>}
    </fieldset>
  );
}

function Pairs({
  items,
  change,
  photoPending,
}: {
  items: IdeaItem[];
  change: (items: IdeaItem[]) => void;
  photoPending?: (value: boolean) => void;
}) {
  return (
    <List<IdeaItem>
      items={items}
      change={change}
      create={() => ({ label: "", value: "" })}
      label="Пункт"
      addLabel={photoPending ? "Добавить раскрывающийся пункт" : undefined}
      title={(item) => item.label}
      render={(item, set) => (
        <>
          <Text
            label="Заголовок"
            value={item.label}
            change={(label) => set({ ...item, label })}
          />
          <Text
            label="Текст"
            value={item.value}
            change={(value) => set({ ...item, value })}
            long
            formatted={Boolean(photoPending)}
          />
          {photoPending && (
            <Photos
              photos={item.photos ?? []}
              change={(photos) => set({ ...item, photos })}
              pending={photoPending}
            />
          )}
        </>
      )}
    />
  );
}

const samplePhotos = [
  "art/celebration.webp",
  "art/bouquet.webp",
  "art/painted-butterfly.png",
];

function newGiftId(items: EditorContent["gifts"]["items"]) {
  let id: number;
  do {
    const [high, low] = crypto.getRandomValues(new Uint32Array(2));
    id = (high & 0x1fffff) * 2 ** 32 + low;
  } while (!id || items.some((gift) => gift.id === id));
  return id;
}

export function ContentEditor() {
  const [content, setContent] = useState<EditorContent>();
  const [section, setSection] = useState<keyof EditorContent>("personal");
  const [panel, setPanel] = useState(true);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [retry, setRetry] = useState(0);
  const [automatic, setAutomatic] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    if (!giftOwner) return;
    const { data } = giftOwner.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session && !session.user.is_anonymous));
    });
    return () => data.subscription.unsubscribe();
  }, []);
  const [release, setRelease] = useState<{
    section: keyof EditorContent;
    state: string;
  }>();
  useEffect(() => {
    let active = true;
    void localEditorRequest("/publish")
      .then((response) => response.json())
      .then(({ enabled }) => {
        if (active) setAutomatic(enabled === true);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (release?.state !== "publishing") return;
    let active = true;
    const timer = setInterval(() => {
      void localEditorRequest("/publish?section=" + release.section)
        .then((response) => response.json())
        .then(({ state }) => {
          if (active && state !== "publishing")
            setRelease({ ...release, state: state ?? "failed" });
        })
        .catch(() => {});
    }, 3000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [release]);
  useEffect(() => {
    let active = true;
    void loadLocalDraft().then(
      (draft) => {
        if (!active) return;
        setMessage("");
        setContent(draft);
      },
      () => {
        if (active) setMessage("Не удалось открыть локальный черновик.");
      },
    );
    return () => {
      active = false;
    };
  }, [retry]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    addEventListener("beforeunload", warn);
    return () => removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (!content)
    return (
      <div role="status">
        {t(message || "Загружаем редактор…")}
        {message && (
          <button type="button" onClick={() => setRetry(retry + 1)}>
            {t("Повторить")}
          </button>
        )}
      </div>
    );

  function edit<K extends keyof EditorContent>(
    key: K,
    value: EditorContent[K],
  ) {
    setContent((current) => current && { ...current, [key]: value });
    setDirty(true);
    setMessage("");
  }
  const { personal, ideas, gifts } = content;
  const photoProps = { pending: setBusy };
  const giftPublishing = automatic && section === "gifts" && Boolean(giftOwner);
  const publishHere = automatic && section !== "gifts";
  const retryPublish =
    release?.section === section &&
    ["failed", "busy", "waiting"].includes(release.state);
  const saveButton = (
    <>
      <button
        className="button"
        type="submit"
        disabled={(!dirty && !publishHere) || release?.state === "publishing"}
      >
        {t(
          publishHere
            ? retryPublish && !dirty
              ? "Повторить публикацию"
              : "Сохранить и опубликовать"
            : "Сохранить черновик",
        )}
      </button>
      {giftPublishing && signedIn && (
        <button className="button" type="submit" value="publish-gifts">
          {t("Сохранить и опубликовать")}
        </button>
      )}
    </>
  );
  return (
    <section className="owner-editor">
      <aside className="owner-sidebar">
        <nav aria-label={t("Разделы редактора")}>
          <button
            type="button"
            aria-current={panel ? "page" : undefined}
            disabled={busy || dirty}
            onClick={() => {
              setPanel(true);

              setMessage("");
            }}
          >
            {t("Панель")}
          </button>
          <h3>{t("Содержимое")}</h3>
          {Object.entries(sections).map(([key, label]) => (
            <button
              type="button"
              key={key}
              aria-current={!panel && section === key ? "page" : undefined}
              disabled={busy || dirty}
              onClick={() => {
                setSection(key as keyof EditorContent);
                setPanel(false);

                setMessage("");
              }}
            >
              {t(label)}
            </button>
          ))}
        </nav>
      </aside>
      <div className="owner-workspace">
        {panel ? (
          <>
            <h2>{t("Панель")}</h2>
            <p>{t("Выберите, что хотите изменить на сайте.")}</p>
            <a
              className="button"
              href="/?draft=1"
              target="_blank"
              rel="noreferrer"
            >
              {t("Предпросмотр черновика")}
            </a>
            <div className="owner-panel-links">
              {Object.entries(sections).map(([key, label]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => {
                    setSection(key as keyof EditorContent);
                    setPanel(false);
                  }}
                >
                  {t(label)}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2>{t(sections[section])}</h2>
            {giftPublishing && !signedIn && (
              <button
                className="button"
                type="button"
                disabled={dirty || busy}
                onClick={async () => {
                  try {
                    const { error } = await giftOwner!.auth.signInWithOAuth({
                      provider: "github",
                      options: { redirectTo: location.origin + "/owner" },
                    });
                    if (error) throw error;
                  } catch {
                    setMessage(
                      "Не удалось войти через GitHub. Попробуй ещё раз.",
                    );
                  }
                }}
              >
                {t("Войти через GitHub для публикации")}
              </button>
            )}
            <fieldset className="owner-form-frame" disabled={busy}>
              {dirty && (
                <p role="status">{t("Есть несохранённые изменения.")}</p>
              )}
              <form
                key={section}
                onSubmit={async (e) => {
                  e.preventDefault();
                  const submitter = (e.nativeEvent as SubmitEvent).submitter;
                  const publishCatalogue =
                    giftPublishing &&
                    submitter instanceof HTMLButtonElement &&
                    submitter.value === "publish-gifts";
                  setBusy(true);
                  setMessage("");
                  setRelease((current) =>
                    current?.section === section &&
                    current.state !== "publishing"
                      ? undefined
                      : current,
                  );
                  try {
                    const response = await localEditorRequest(
                      "?section=" + section,
                      {
                        method: "PUT",
                        body: JSON.stringify(content),
                      },
                    );
                    const { state } = await response.json();
                    setDirty(false);
                    setMessage(
                      state === "local"
                        ? "Черновик сохранён на компьютере."
                        : "",
                    );
                    if (publishCatalogue) {
                      setMessage("Черновик сохранён. Публикуем вишлист…");
                      try {
                        await publishGifts(gifts);
                        setMessage("");
                        setRelease({ section, state: "live" });
                      } catch {
                        setMessage(
                          "Черновик сохранён. Опубликовать вишлист не удалось. Проверь вход владельца и повтори публикацию.",
                        );
                      }
                    } else if (state !== "local") {
                      setRelease({ section, state });
                    }
                  } catch {
                    setMessage(
                      "Сохранить не удалось. Введённые изменения остались в редакторе.",
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <div className="owner-save">{saveButton}</div>
                <Text
                  label="Вступление"
                  value={content[section].intro}
                  long
                  formatted={section === "ideas"}
                  change={(intro) => {
                    setContent({
                      ...content,
                      [section]: { ...content[section], intro },
                    });
                    setDirty(true);
                    setMessage("");
                  }}
                />
                {section === "personal" && (
                  <>
                    <label>
                      <input
                        type="checkbox"
                        checked={personal.showLink !== false}
                        onChange={(event) =>
                          edit("personal", {
                            ...personal,
                            showLink: event.target.checked,
                          })
                        }
                      />
                      {t("Показывать ссылку «Это всё я»")}
                    </label>
                    <List
                      items={personal.stories}
                      change={(stories) =>
                        edit("personal", { ...personal, stories })
                      }
                      create={() => ({
                        id: Date.now(),
                        title: "",
                        label: "Фотография",
                        description: "",
                        photos: [],
                      })}
                      columns
                      itemKey={(item) => String(item.id)}
                      label="История"
                      orderLabel="История"
                      title={(item) => item.title}
                      render={(item, set) => (
                        <>
                          <Text
                            label="Заголовок"
                            value={item.title}
                            change={(title) => set({ ...item, title })}
                          />
                          <Text
                            label="Описание фотографии"
                            value={item.label}
                            change={(label) => set({ ...item, label })}
                          />
                          <Text
                            label="Текст истории"
                            value={item.description}
                            change={(description) =>
                              set({ ...item, description })
                            }
                            long
                          />
                          <Photos
                            {...photoProps}
                            square
                            photos={item.photos ?? samplePhotos}
                            change={(photos) => set({ ...item, photos })}
                          />
                        </>
                      )}
                    />
                    <h3>{t("Маленькие предпочтения")}</h3>
                    <Pairs
                      items={personal.preferences}
                      change={(preferences) =>
                        edit("personal", { ...personal, preferences })
                      }
                    />
                  </>
                )}
                {section === "ideas" && (
                  <List
                    items={ideas.cards}
                    change={(cards) => edit("ideas", { ...ideas, cards })}
                    create={() => ({
                      id: crypto.randomUUID(),
                      title: "",
                      description: "",
                      photos: [],
                      items: [],
                    })}
                    itemKey={(card) => card.id}
                    label="Карточка"
                    addLabel="Добавить карточку"
                    title={(card) => card.title}
                    columns
                    orderLabel="Карточка темы"
                    render={(card, set) => (
                      <>
                        <Text
                          label="Заголовок карточки"
                          value={card.title}
                          change={(title) => set({ ...card, title })}
                        />
                        <Text
                          label="Описание карточки · видно сразу"
                          value={card.description}
                          change={(description) =>
                            set({ ...card, description })
                          }
                          formatted
                        />
                        <Photos
                          {...photoProps}
                          photos={card.photos}
                          change={(photos) => set({ ...card, photos })}
                        />
                        <label className="owner-inline-check">
                          <input
                            type="checkbox"
                            checked={card.galleryAfterItems === true}
                            onChange={(event) =>
                              set({
                                ...card,
                                galleryAfterItems: event.target.checked,
                              })
                            }
                          />
                          {t("Галерея после раскрывающихся пунктов")}
                        </label>
                        <fieldset className="owner-topic-entries">
                          <legend>{t("Раскрывающиеся пункты")}</legend>
                          <p>
                            {t(
                              "Гости увидят заголовок пункта и откроют его по плюсику.",
                            )}
                          </p>
                          <Pairs
                            items={card.items}
                            change={(items) => set({ ...card, items })}
                            photoPending={setBusy}
                          />
                        </fieldset>
                      </>
                    )}
                  />
                )}
                {section === "gifts" && (
                  <List<EditorContent["gifts"]["items"][number]>
                    columns
                    items={gifts.items}
                    change={(items) => edit("gifts", { ...gifts, items })}
                    create={() => ({
                      id: newGiftId(gifts.items),
                      name: "",
                      category: "",
                      price: 0,
                      description: "",
                      availability: "available",
                      shape: "vase",
                    })}
                    itemKey={(item) => String(item.id)}
                    label="Подарок"
                    orderLabel="Подарок"
                    title={(item) => item.name}
                    render={(item, set) => (
                      <>
                        <Text
                          label="Название"
                          value={item.name}
                          change={(name) => set({ ...item, name })}
                        />
                        <Text
                          label="Категория"
                          value={item.category}
                          change={(category) => set({ ...item, category })}
                        />
                        <label>
                          {t("Цена в тенге")}
                          <input
                            type="number"
                            min={0}
                            max={100000000}
                            required
                            value={item.price}
                            onChange={(e) =>
                              set({ ...item, price: Number(e.target.value) })
                            }
                          />
                        </label>
                        <Text
                          label="Описание"
                          value={item.description}
                          change={(description) =>
                            set({ ...item, description })
                          }
                          long
                        />
                        <Text
                          label="Название магазина"
                          value={item.shop?.name ?? ""}
                          change={(name) =>
                            set({
                              ...item,
                              shop: { name, url: item.shop?.url ?? "" },
                            })
                          }
                        />
                        <label>
                          {t("Ссылка на магазин")}
                          <input
                            type="url"
                            pattern="https?://.+"
                            value={item.shop?.url ?? ""}
                            onChange={(e) =>
                              set({
                                ...item,
                                shop: {
                                  name: item.shop?.name ?? "",
                                  url: e.target.value,
                                },
                              })
                            }
                          />
                        </label>
                        <Photos
                          {...photoProps}
                          photos={item.images?.map(({ src }) => src) ?? []}
                          change={(photos) =>
                            set({
                              ...item,
                              images: photos.map((src) => ({
                                src,
                                alt: item.name,
                              })),
                            })
                          }
                        />
                      </>
                    )}
                  />
                )}
                <div className="owner-save">{saveButton}</div>
              </form>
            </fieldset>
            {message && <p role="status">{t(message)}</p>}
            {release?.section === section && publishMessage[release.state] && (
              <p role="status">
                {t(publishMessage[release.state])}{" "}
                {release.state === "live" && (
                  <a
                    href={
                      "https://adilya-batyrbekova.github.io/invitation_25years/#/" +
                      (release.section === "personal" ? "personal" : "wishlist")
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("Открыть публичный сайт")}
                  </a>
                )}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
