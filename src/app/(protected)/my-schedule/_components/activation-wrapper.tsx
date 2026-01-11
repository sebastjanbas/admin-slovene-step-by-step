"use client";

import {TutorActivationDialog} from "./tutor-activation-dialog";
import {activateTutorAccount} from "@/actions/admin-actions";
import {useRouter} from "next/navigation";

interface ActivationWrapperProps {
  isActivated: boolean;
}

export function ActivationWrapper({isActivated}: ActivationWrapperProps) {
  const router = useRouter();

  const handleActivate = async (formData: FormData) => {
    await activateTutorAccount(formData);
    router.refresh();
  };

  return (
    <TutorActivationDialog open={!isActivated} onActivate={handleActivate}/>
  );
}
