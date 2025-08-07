import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { useRef, useState } from 'react'
import { colors, spacingX, spacingY } from '@/constants/theme';
import { verticalScale } from '@/utils/styling';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/typo';
import BackButton from '@/components/BackButton';
import Input from '@/components/Input';
import Button  from '../../components/Button';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/authContext';


const Login = () => {
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);
  const {login : loginUser} = useAuth()

  const router = useRouter();

  const handleSubmit = async()=>{
      if(!emailRef.current || !passwordRef.current){
        Alert.alert("Login", "Please fill in all of the details");
        return;
      }

     setLoading(true);
     const res = await loginUser(emailRef.current, passwordRef.current);
     setLoading(false);
     if(!res.success){
      Alert.alert("Login", res.msg)
     } 
  };

  return (
    <ScreenWrapper>
        
        <View style = {styles.container}>
            <BackButton iconSize={26}/>

            <View style={{gap : 5, marginTop : spacingY._20}}>
              <Typo size={30} fontWeight={"800"}>
                Hey,
              </Typo>
              <Typo size={30} fontWeight={"800"}>
                Welcome Back!
              </Typo>
            </View>

            {/* form */}
            <View style = {styles.form}>
              <Typo size={16} color={colors.textLighter}>
                Login to Manage your all Expenses
              </Typo>

              {/* input */}
              <Input 
              onChangeText={(value)=>{
                  (emailRef.current = value)
              }}  
              placeholder='Enter your email'/>

              <Input 
              secureTextEntry
              onChangeText={(value)=>{
                  (passwordRef.current = value)
              }}  
              placeholder='Enter your password'/>

              <Button loading = {loading} onPress={handleSubmit}>
                <Typo fontWeight={"700"} size={21} color={colors.black}>
                  Login
                </Typo>
              </Button>

              {/* footer */}
              <View style={styles.footer}>
                  <Typo size={15}>
                    Don't have an Account? 
                    </Typo>
                    <Pressable onPress={()=> router.navigate("/(auth)/register")}>
                     <Typo size={15} fontWeight={"500"} color={colors.lightGreen}>
                        Sign up
                     </Typo>
                    </Pressable>
              </View>
            </View>
        </View>
        
    </ScreenWrapper>
  )
}

export default Login;

const styles = StyleSheet.create({
    container: {
    flex: 1,
    paddingHorizontal: spacingX._25,
  },
  welcomeText: {
    fontSize: verticalScale(20),
    fontWeight: "bold",
    color: colors.text,
  },
  form: {
    gap : spacingY._20,
  },
  forgotPassword: {
    textAlign: "right",
    fontWeight: "500",
    color: colors.text,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap : 6,
  },
  footerText: {
    textAlign: "center",
    color: colors.text,
    fontSize: verticalScale(15),
  },
});