import {SignIn} from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <SignIn
        fallback={
          <div className="w-[450px] h-[350px] bg-foreground/5 animate-pulse rounded-3xl p-5">
            <div className="w-[150px] h-[20px] mx-auto mt-8 bg-foreground/10 animate-pulse rounded-full"/>
            <div className="w-[350px] h-[30px] mx-auto mt-8 bg-foreground/15 animate-pulse rounded-full"/>
            <div className="w-[350px] h-[2px] mx-auto mt-8 bg-foreground/10 animate-pulse rounded-full"/>
            <div className="w-[150px] h-[15px] ml-8 mt-8 bg-foreground/10 animate-pulse rounded-full"/>
            <div className="w-[350px] h-[30px] mx-auto mt-2 bg-foreground/15 animate-pulse rounded-full"/>
            <div className="w-[350px] h-[35px] mx-auto mt-8 bg-foreground/20 animate-pulse rounded-full"/>
          </div>
        }
        appearance={{
          elements: {
            cardBox: {
              // boxShadow: "none",
              borderRadius: 35,
              width: "450px",
            },
            card: {
              padding: "3rem",
              // boxShadow: "none",
              // borderRadius: 0,
            },
            input: {
              borderRadius: 10,
            },
            button: {
              borderRadius: 10,
            },
            footer: {
              display: "none",
            },
          },
        }}
        fallbackRedirectUrl={"/dashboard"}
      />
    </div>
  )
}
