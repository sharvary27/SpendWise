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



const Register = () => {
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const nameRef = useRef("");
  const {register : registerUser} = useAuth();
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async()=>{
      if(!emailRef.current || !passwordRef.current || !nameRef.current){
        Alert.alert("Login", "Please fill in all of the details");
        return;
      };
      setLoading(true);
      const res = await registerUser(
        emailRef.current,
        passwordRef.current,
        nameRef.current,
      );
      setLoading(false);
      console.log("register result: ", res);
      if(!res.success){
          Alert.alert("Sign Up", res.msg);
      }
  };

  return (
    <ScreenWrapper>
        
        <View style = {styles.container}>
            <BackButton iconSize={26}/>

            <View style={{gap : 5, marginTop : spacingY._20}}>
              <Typo size={30} fontWeight={"800"}>
                New to SpendWise?
              </Typo>
              <Typo size={30} fontWeight={"800"}>
                Join Us
              </Typo>
            </View>

            {/* form */}
            <View style = {styles.form}>
              <Typo size={16} color={colors.textLighter}>
                Create an Account
              </Typo>

              {/* input */}
              <Input 
              onChangeText={(value)=>{
                  (nameRef.current = value)
              }}  
              placeholder='Enter your Name'/>

              <Input 
              onChangeText={(value)=>{
                  (emailRef.current = value)
              }}  
              placeholder='Enter your Email'/>

              <Input 
              secureTextEntry
              onChangeText={(value)=>{
                  (passwordRef.current = value)
              }}  
              placeholder='Enter your Password'/>

              <Button loading = {loading} onPress={handleSubmit}>
                <Typo fontWeight={"700"} size={21} color={colors.black}>
                  Register
                </Typo>
              </Button>
              </View>

              {/* footer */}
              <View style={styles.footer}>
                  <Typo size={15}>
                   Already have an Account? 
                    </Typo>
                    <Pressable onPress={()=> router.navigate("/(auth)/login")}>
                     <Typo size={15} fontWeight={"700"} color={colors.lightGreen}>
                        Sign In
                     </Typo>
                    </Pressable>
              </View>
        </View>
        
    </ScreenWrapper>
  )
}

export default Register;

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

