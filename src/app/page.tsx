"use client";

import {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  API,
  AuthorizationError,
  UrlRedirect,
  UrlRedirectResponse,
} from "./_lib/api";
import { AuthContext } from "./_lib/auth";
import { PencilIcon, PlusIcon, TrashIcon } from "@heroicons/react/16/solid";
import { LoadingIcon, withLoading } from "./_component/global-loading";
import { useRouter } from "next/navigation";
import { ConfirmationModal, EditModal } from "./_component/edit-modal";
import { redirectBaseUrl } from "./_lib/server/api-url";
import Link from "next/link";

type FormUrlRedirect = Omit<UrlRedirect, "id"> &
  Pick<Partial<UrlRedirect>, "id">;

export default function Home() {
  const authContext = useContext(AuthContext);

  const [content, setContent] = useState<UrlRedirectResponse | undefined>(
    undefined,
  );
  const [redirectUrl, setRedirectUrl] = useState<string>("");
  const [isFormLoading, setIsFormLoading] = useState<boolean>(false);
  const [isTableLoading, setIsTableLoading] = useState<boolean>(false);
  const [hasNext, setHasNext] = useState<boolean>(true);
  const [{ isModalOpen: isFormOpen, data: formData }, setFormState] = useState<{
    isModalOpen: boolean;
    data?: FormUrlRedirect;
  }>({ isModalOpen: false, data: undefined });
  const [
    { isModalOpen: isDeleteConfirmationOpen, data: deleteConfirmationData },
    setDeleteConfirmationData,
  ] = useState<{
    isModalOpen: boolean;
    data?: UrlRedirect;
  }>({ isModalOpen: false, data: undefined });

  const user = authContext.user;

  useEffect(() => {
    (async () => {
      if (user) {
        const api = await API.get();
        const redirects = await withLoading(setIsTableLoading, () =>
          api.getRedirects(user.token, { limit: 50 }),
        );

        setRedirectUrl(await redirectBaseUrl());
        setContent((content) => content || redirects);
      }
    })();
  }, [user]);

  const onLoadMore = useCallback(async () => {
    if (!user || !content || !hasNext) {
      return;
    }

    const last = content.last;
    const api = await API.get();
    const redirects = await withLoading(setIsTableLoading, () =>
      api.getRedirects(user.token, { limit: 50, after: last }),
    );

    if (redirects.data.length === 0) {
      setHasNext(false);
    } else {
      setContent((content) =>
        content?.last !== last
          ? content
          : {
              data: [...content.data, ...redirects.data],
              last: redirects.last,
            },
      );
    }
  }, [content]);

  const onEditClick = (data: UrlRedirect) => {
    setFormState({
      isModalOpen: true,
      data,
    });
  };

  const onDeleteClick = (data: UrlRedirect) => {
    setDeleteConfirmationData({
      isModalOpen: true,
      data,
    });
  };

  const onSubmit = async ({ id, key, target }: FormUrlRedirect) => {
    const api = await API.get();
    const user = authContext.user;
    if (!user) {
      throw new AuthorizationError();
    }

    if (!content) {
      return;
    }

    if (!id) {
      let newRedirect = await withLoading(setIsFormLoading, () =>
        api.createRedirect(user.token, { key, target }),
      );
      setContent({
        ...content,
        data: [...content.data, newRedirect],
      });
    } else {
      await withLoading(setIsFormLoading, () =>
        api.updateRedirect(user.token, { id, key, target }),
      );
      setContent({
        ...content,
        data:
          content.data.map((item) =>
            item.id == id ? { id, key, target } : item,
          ) || [],
      });
    }
  };

  const onDeleteConfirm = async (id: string) => {
    const api = await API.get();
    const user = authContext.user;
    if (!user) {
      throw new AuthorizationError();
    }

    if (!content) {
      return;
    }

    await withLoading(setIsFormLoading, () =>
      api.deleteRedirect(user.token, id),
    );
    setContent({
      ...content,
      data: content.data.filter((item) => item.id !== id),
    });
  };

  if (!authContext.user) {
    return <div>Please login</div>;
  }

  return (
    <main className="flex flex-col items-center p-5">
      <ConfirmationModal
        open={isDeleteConfirmationOpen}
        onClose={(open) =>
          setDeleteConfirmationData({
            isModalOpen: open,
            data: deleteConfirmationData,
          })
        }
      >
        <DeleteConfirmationDialog
          data={deleteConfirmationData!}
          isLoading={isFormLoading}
          onCancel={(data) =>
            setDeleteConfirmationData({ isModalOpen: false, data })
          }
          onConfirm={(data) => {
            (async () => {
              await onDeleteConfirm(data.id);
              setDeleteConfirmationData({ isModalOpen: false, data });
            })();
          }}
        />
      </ConfirmationModal>

      <EditModal
        open={isFormOpen}
        onClose={(open) => setFormState({ isModalOpen: open, data: formData })}
      >
        <EditForm
          data={formData}
          isLoading={isFormLoading}
          onSubmit={(data) => {
            (async () => {
              await onSubmit(data);
              setFormState({ isModalOpen: false, data });
            })();
          }}
          onCancel={(data) => {
            setFormState({ isModalOpen: false, data });
          }}
        />
      </EditModal>

      {content ? (
        <>
          <div className="flex flex-row-reverse py-1 min-w-full">
            <button
              className="group/add flex flex-row overflow-hidden items-center rounded-md bg-gray-800 py-1 px-2 w-8 h-8 transition-width duration-300 ease-linear hover:w-18"
              onClick={() => setFormState({ isModalOpen: true })}
            >
              <PlusIcon className="size-5 fill-white" />
              <div className="w-0">
                <span className="text-sm text-gray-800 w-0 pl-1 transition-colors duration-300 ease-lienar group-hover/add:text-current">
                  Add
                </span>
              </div>
            </button>
          </div>
          <RedirectTable
            content={content}
            redirectUrl={redirectUrl}
            isLoading={isTableLoading}
            hasNext={hasNext}
            onLoadMore={onLoadMore}
            onEdit={onEditClick}
            onDelete={onDeleteClick}
          />
        </>
      ) : (
        <div className="p-20">
          <LoadingIcon />
        </div>
      )}
    </main>
  );
}

function RedirectTable({
  content,
  redirectUrl,
  isLoading,
  hasNext,
  onLoadMore,
  onEdit,
  onDelete,
}: {
  content: UrlRedirectResponse;
  redirectUrl: string;
  isLoading: boolean;
  hasNext: boolean;
  onLoadMore: () => void;
  onEdit: (data: UrlRedirect) => void;
  onDelete: (data: UrlRedirect) => void;
}): ReactNode {
  const router = useRouter();
  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 1 },
    );

    if (observerTarget.current && hasNext) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerTarget, content, hasNext]);

  return (
    <>
      <table className="border-separate bg-gray-900 border-2 border-spacing-y-0 rounded-md min-w-0">
        <thead className="bg-gray-800 border-spacing">
          <tr>
            <th className="p-2">Key</th>
            <th className="p-2">Target</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {content.data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-950">
              <td className="p-1">
                <Link
                  className="contents"
                  href={redirectUrl + "/" + encodeURIComponent(item.key)}
                >
                  <button className="w-full hover:text-blue-500 text-left">
                    {item.key}
                  </button>
                </Link>
              </td>
              <td className="p-1">{item.target}</td>
              <td className="p-1 text-center align-middle">
                <button className="inline" onClick={() => onEdit(item)}>
                  <PencilIcon className="size-4 fill-white/60 hover:fill-yellow-300" />
                </button>
                <button className="inline" onClick={() => onDelete(item)}>
                  <TrashIcon className="size-4 fill-white/60 hover:fill-red-600" />
                </button>
              </td>
            </tr>
          ))}
          {isLoading ? (
            <tr>
              <td colSpan={3}>
                <div className="flex min-w-full justify-center pt-5">
                  <LoadingIcon />
                </div>
              </td>
            </tr>
          ) : (
            []
          )}
        </tbody>
      </table>
      <div ref={observerTarget} />
    </>
  );
}

function EditForm({
  data,
  onSubmit,
  onCancel,
  isLoading,
}: {
  data?: FormUrlRedirect;
  onSubmit: (value: FormUrlRedirect) => void;
  onCancel: (value: FormUrlRedirect) => void;
  isLoading?: boolean;
}): ReactNode {
  let [key, setKey] = useState(data?.key || "");
  let [target, setTarget] = useState(data?.target || "");
  const inputElement = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputElement.current?.focus();
  }, []);

  useEffect(() => {
    setKey(data?.key || "");
    setTarget(data?.target || "");
  }, [data]);

  return (
    <form
      className="flex flex-col gap-1 m-2"
      action={() => {
        onSubmit({ id: data?.id, key, target });
      }}
    >
      <label>Key</label>
      <input
        ref={inputElement}
        id="key"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        className="text-black"
        tabIndex={1}
        type="text"
        autoFocus={true}
        placeholder="Key"
      />
      <label>Target</label>
      <input
        id="target"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        className="text-black"
        tabIndex={2}
        type="text"
        placeholder="Target"
      />
      <div className="flex flex-row justify-center gap-x-3">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => onCancel({ id: data?.id, key, target })}
          tabIndex={4}
          className="px-1 pb-1 border-1 bg-red-400 rounded-md box-content h-min"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-1 pb-1 border-1 bg-green-400 rounded-md box-content h-min"
          tabIndex={3}
        >
          {isLoading ? "Loading..." : "Submit"}
        </button>
      </div>
    </form>
  );
}

function DeleteConfirmationDialog({
  data,
  isLoading,
  onCancel,
  onConfirm,
}: {
  data: UrlRedirect;
  isLoading: boolean;
  onCancel: (data: UrlRedirect) => void;
  onConfirm: (data: UrlRedirect) => void;
}): ReactNode {
  const confirmButton = useRef<HTMLButtonElement>(null);
  const formatTarget = (target: string) => {
    if (target.length > 35) {
      return target.slice(0, 25) + "..." + target.slice(-10);
    }
    return target;
  };

  useEffect(() => {
    confirmButton.current?.focus();
  }, [confirmButton]);

  return (
    <div className="flex flex-col gap-1 m-2">
      <span>Are you sure you want to delete?</span>
      {data ? (
        <span>
          {data.key} {String.fromCharCode(8594)} {formatTarget(data.target)}
        </span>
      ) : (
        []
      )}
      <div className="flex flex-row justify-center gap-x-3 pt-2">
        <button
          type="button"
          onClick={() => onCancel(data)}
          className="w-28 px-1 pb-1 border-1 bg-red-400 rounded-md box-content h-min"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          ref={confirmButton}
          type="button"
          onClick={() => onConfirm(data)}
          className="w-28 px-1 pb-1 border-1 bg-green-400 rounded-md box-content h-min"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Confirm"}
        </button>
      </div>
    </div>
  );
}
