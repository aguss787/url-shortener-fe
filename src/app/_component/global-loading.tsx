export function LoadingOverlay() {
  return (
    <div className="z-auto absolute top-0 min-w-full min-h-full bg-black bg-opacity-50 flex flex-row items-center justify-center">
      {<LoadingIcon />}
    </div>
  );
}

export const LoadingIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="flex-inline size-12 animate-bounce"
  >
    <path
      fillRule="evenodd"
      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-.53 14.03a.75.75 0 0 0 1.06 0l3-3a.75.75 0 1 0-1.06-1.06l-1.72 1.72V8.25a.75.75 0 0 0-1.5 0v5.69l-1.72-1.72a.75.75 0 0 0-1.06 1.06l3 3Z"
      clipRule="evenodd"
    />
  </svg>
);

export async function withLoading<T>(
  stateFn: (isLoading: boolean) => void,
  f: () => Promise<T>,
): Promise<T> {
  try {
    stateFn(true);
    return await f();
  } finally {
    stateFn(false);
  }
}
