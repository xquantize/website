type IconProps = {
  className?: string;
  title?: string;
};

/** Simple monoline brand marks for contact / social links. */
export function GitHubIcon({ className, title = "GitHub" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d="M12 2C6.477 2 2 6.586 2 12.253c0 4.53 2.865 8.372 6.839 9.725.5.094.682-.222.682-.493 0-.243-.009-.888-.014-1.743-2.782.619-3.37-1.37-3.37-1.37-.454-1.18-1.11-1.494-1.11-1.494-.908-.637.069-.624.069-.624 1.004.072 1.532 1.055 1.532 1.055.892 1.564 2.341 1.112 2.91.85.091-.662.35-1.112.636-1.368-2.22-.259-4.555-1.138-4.555-5.066 0-1.119.39-2.034 1.029-2.751-.103-.259-.446-1.302.098-2.714 0 0 .84-.275 2.75 1.05A9.36 9.36 0 0 1 12 6.844c.85.004 1.705.117 2.504.343 1.909-1.325 2.747-1.05 2.747-1.05.546 1.412.203 2.455.1 2.714.64.717 1.028 1.632 1.028 2.751 0 3.939-2.339 4.804-4.566 5.058.359.317.679.943.679 1.901 0 1.371-.013 2.477-.013 2.814 0 .274.18.592.688.492C19.138 20.62 22 16.78 22 12.253 22 6.586 17.523 2 12 2Z" />
    </svg>
  );
}

export function LinkedInIcon({ className, title = "LinkedIn" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1-.001-4.125 2.062 2.062 0 0 1 .001 4.125zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

/** Compact TT mark — TensorTonic doesn’t ship a simple public mark. */
export function TensorTonicIcon({ className, title = "TensorTonic" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M7.2 8.2h9.6M12 8.2v7.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
