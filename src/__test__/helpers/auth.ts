import { getSDK } from "../utils/graphqlSDK";
export const getAdminAccessToken = async () => {
  return getSDK().adminLogin({
    data:{
      email:"admin@comartek.com",
      password:"admin@123"

    }
  })
    .then((j) => j.adminLogin.token);
};
