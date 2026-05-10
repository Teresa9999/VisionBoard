export const LOCAL_DEMO_USER = {
  id: "local-demo-user",
  email: "local-demo@vision-board.test",
  name: "Local Demo User",
  avatarUrl: null,
};

export function isLocalDemoMode() {
  return (
    process.env.LOCAL_DEMO !== "false" &&
    process.env.NEXT_PUBLIC_LOCAL_DEMO !== "false"
  );
}
