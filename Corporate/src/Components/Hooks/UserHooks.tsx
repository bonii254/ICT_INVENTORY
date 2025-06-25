import { useEffect, useState } from "react";
import { getUserInfo } from "../../helpers/api_helper";

const useProfile = () => {
  const userProfileSession = getUserInfo();
  var token =
  userProfileSession;
  const [loading, setLoading] = useState(userProfileSession ? false : true);
  const [userProfile, setUserProfile] = useState(
    userProfileSession ? userProfileSession : null
  );

  useEffect(() => {
    const userProfileSession = getUserInfo();
    var token =
      userProfileSession;
    setUserProfile(userProfileSession ? userProfileSession : null);
    setLoading(token ? false : true);
  }, []);


  return { userProfile, loading, token };
};

export { useProfile };
