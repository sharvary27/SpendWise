import React, { createContext, useState, useContext, useEffect } from "react";
import { AuthContextType, UserType } from "@/types";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { auth, fireStore } from "@/config/firebase";
import { getDoc, setDoc } from "firebase/firestore";
import { doc } from "firebase/firestore";
import { router } from "expo-router";


const AuthContext = createContext <AuthContextType | null>(null);

export const AuthProvider : React.FC<{children : React.ReactNode}> = ({
    children,
}) =>{

    const [user, setUser] = useState<UserType>(null);

    useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      setUser({
        uid: firebaseUser?.uid,
        email: firebaseUser?.email,
        name: firebaseUser?.displayName,
      });

    updateUserData(firebaseUser.uid);
    router.replace("/(tabs)");


    } else {
      // No user
      setUser(null);
      router.replace("/(auth)/welcome");
    }
  });

  return () => unsub();
}, []);


    const login = async (email : string, password : string)=>{
        try{
            await signInWithEmailAndPassword(auth, email, password);
            return {success : true}
        }catch(error : any){
            let msg = error.message;
            console.log("Error: ", msg);
            if(msg.includes("(auth/invalid-credential)")) msg = "Wrong credentials"
            if(msg.includes("(auth/invalid-email)")) msg = "Invalid Email"
            return { success : false, msg}
        }
    };

     const register = async (email : string, password : string , name : string)=>{
        try{
            let response = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(fireStore, "users", response?.user?.uid), {
                name, email , uid : response?.user?.uid,
            });
            return {success : true}
        }catch(error : any){
            let msg = error.message;
            console.log("Error: ", msg);
            if(msg.includes("(auth/email-already-in-use)")) msg = "Email Already in Use"
            if(msg.includes("(auth/invalid-email)")) msg = "Invalid Email"
            return { success : false, msg}
        }
    };

    const updateUserData = async (uid : string)=>{
        try{
            const docRef = doc(fireStore, "users", uid);
            const docSnap = await getDoc(docRef);

            if(docSnap.exists()){
                const data = docSnap.data();
                const userData : UserType = {
                    uid : data?.uid,
                    name : data.name || null,
                    email : data.email || null,
                    image : data.image || null,
                };
                setUser({...userData});
            }
        }catch(error : any){
            let msg = error.message;
            console.log("error : ", msg);
        }
    };

    const contextValue: AuthContextType = {
        user,
        setUser,
        login,
        register,
        updateUserData,
    };

return (
  <AuthContext.Provider value={contextValue}>
    {children}
  </AuthContext.Provider>
);

};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be wrapped inside AuthProvider");
  }

  return context;
};

