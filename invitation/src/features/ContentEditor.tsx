import { useEffect, useId, useRef, useState } from "react";
import {
  loadLocalDraft,
  localEditorRequest,
  type EditorContent,
} from "../data/editorContent";
import { t } from "../lib/typography";

const sections = {
  personal: "Это всё я",
  ideas: "Что мне нравится",
  gifts: "Вишлист",
};

function Text({
  label,
  value,
  change,
  long = false,
}: {
  label: string;
  value: string;
  change: (value: string) => void;
  long?: boolean;
}) {
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
}: {
  items: T[];
  change: (items: T[]) => void;
  create: () => T;
  render: (item: T, change: (item: T) => void) => React.ReactNode;
  label: string;
  title: (item: T) => string;
  columns?: boolean;
}) {
  const group = useId();
  const [added, setAdded] = useState<number>();
  return (
    <div
      className={columns ? "owner-records owner-records-grid" : "owner-records"}
    >
      {items.map((item, index) => (
        <details
          className="owner-record"
          key={index}
          name={group}
          open={index === added || undefined}
        >
          <summary>{t(title(item) || label + " " + (index + 1))}</summary>
          <div className="owner-record-fields">
            {render(item, (value) =>
              change(items.map((entry, i) => (i === index ? value : entry))),
            )}
            <Order
              index={index}
              count={items.length}
              remove={() => change(items.filter((_, i) => i !== index))}
              move={(to) => {
                const next = [...items];
                [next[index], next[to]] = [next[to], next[index]];
                change(next);
              }}
            />
          </div>
        </details>
      ))}
      <button
        type="button"
        disabled={items.length >= 30}
        onClick={() => {
          setAdded(items.length);
          change([...items, create()]);
        }}
      >
        {t("Добавить запись")}
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
    <fieldset>
      <legend>{t("Кадрирование фотографии")}</legend>
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
      {!square && (
        <label>
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
      <button className="button" type="button" disabled={busy} onClick={cancel}>
        {t("Отмена")}
      </button>
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
}: {
  items: { label: string; value: string }[];
  change: (items: { label: string; value: string }[]) => void;
}) {
  return (
    <List
      items={items}
      change={change}
      create={() => ({ label: "", value: "" })}
      label="Пункт"
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
          />
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
  const saveButton = (
    <button className="button" type="submit" disabled={!dirty}>
      {t("Сохранить черновик")}
    </button>
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
            <fieldset className="owner-form-frame" disabled={busy}>
              {dirty && (
                <p role="status">{t("Есть несохранённые изменения.")}</p>
              )}
              <form
                key={section}
                onSubmit={async (e) => {
                  e.preventDefault();
                  setBusy(true);
                  try {
                    await localEditorRequest("", {
                      method: "PUT",
                      body: JSON.stringify(content),
                    });
                    setDirty(false);
                    setMessage("Черновик сохранён на компьютере.");
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
                      label="История"
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
                  <>
                    <Text
                      label="Заголовок блока интерьера"
                      value={ideas.interiorTitle}
                      change={(interiorTitle) =>
                        edit("ideas", { ...ideas, interiorTitle })
                      }
                    />
                    <Text
                      label="Текст о дизайне интерьера"
                      value={ideas.interiorText}
                      change={(interiorText) =>
                        edit("ideas", { ...ideas, interiorText })
                      }
                      long
                    />
                    <Photos
                      {...photoProps}
                      photos={ideas.interiorPhotos}
                      change={(interiorPhotos) =>
                        edit("ideas", { ...ideas, interiorPhotos })
                      }
                    />
                    <Text
                      label="Заголовок блока о книгах"
                      value={ideas.booksTitle}
                      change={(booksTitle) =>
                        edit("ideas", { ...ideas, booksTitle })
                      }
                    />
                    <Pairs
                      items={ideas.books}
                      change={(books) => edit("ideas", { ...ideas, books })}
                    />
                    <Text
                      label="Заголовок блока о кружках"
                      value={ideas.cupsTitle}
                      change={(cupsTitle) =>
                        edit("ideas", { ...ideas, cupsTitle })
                      }
                    />
                    <Text
                      label="Текст о кружках"
                      value={ideas.cupsText}
                      change={(cupsText) =>
                        edit("ideas", { ...ideas, cupsText })
                      }
                      long
                    />
                    <Photos
                      {...photoProps}
                      photos={ideas.cupsPhotos ?? samplePhotos}
                      change={(cupsPhotos) =>
                        edit("ideas", { ...ideas, cupsPhotos })
                      }
                    />
                  </>
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
                    label="Подарок"
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
                          label="Дополнительная заметка"
                          value={item.note ?? ""}
                          change={(note) => set({ ...item, note })}
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
          </>
        )}
      </div>
    </section>
  );
}
