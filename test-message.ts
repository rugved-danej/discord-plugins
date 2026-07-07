import { findByStoreName } from "@vendetta/metro";
const UserStore = findByStoreName("UserStore");
console.log(UserStore?.getCurrentUser ? "UserStore found" : "UserStore NOT found");
