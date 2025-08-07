import { fireStore } from "@/config/firebase";
import { ResponseType, UserDataType } from "@/types";
import { doc, updateDoc } from "firebase/firestore"; // v9.04 (replaced 134.0k)
import { uploadFileToCloudinary } from "./ImageServices";

export const updateUser = async (
  uid: string,
  updateData: UserDataType
): Promise<ResponseType> => {
  try {
    if(!updateData.image && updateData?.image?.uri){
        const imageUploadRes = await uploadFileToCloudinary(
            updateData.image,
            "users"
        );
        if(!imageUploadRes.success){
            return{
                success : false,
                msg : imageUploadRes.msg || "Failed to upload image"
            };
        }
        updateData.image = imageUploadRes.data;
    }
    
    const userRef = doc(fireStore, "users", uid);
    await updateDoc(userRef, updateData);
    
    return { success: true, msg: "updated successfully" };
  } catch (error: any) {
    console.log("error updating user: ", error);
    return { success: false, msg: error?.message };
  }
};