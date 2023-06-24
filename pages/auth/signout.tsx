import { signOut } from "next-auth/react";
import { useEffect } from "react";

import { useUser } from "../../src/context/userContext";

import { BipPage } from "../../src/commons/types";
import BipLoader from "../../src/components/BipLoader";

const SignoutPage: BipPage = () => {
  const { logout } = useUser();

  useEffect(() => {
    signOut().then(async (r) => {
      await logout(false);
    });
  }, []);
  return <BipLoader />;
};

SignoutPage.auth = false;
export default SignoutPage;
