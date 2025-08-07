import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { verticalScale } from '@/utils/styling';
import Typo from '@/components/typo';
import Button from '@/components/Button';
import { useRouter } from 'expo-router';
// import welcomeImg from '@/assets/welcome.png'; 

const Welcome = () => {
    const router = useRouter();
  return (
    <ScreenWrapper>
       <View style = {styles.container}>

        {/* login */}

        <View>
            <TouchableOpacity onPress={()=> router.push('/(auth)/login')} style = {styles.loginButton}>
                <Typo fontWeight={"500"}>Sign In</Typo>
            </TouchableOpacity>

            <Image
            source = {require("../../assets/images/welcome.png")}
            resizeMode = "contain"
            style = {styles.welcomeImage}
            />
        </View>

        {/* footer */}
        <View style ={styles.footer}>
            <View style = {{alignItems: "center"}}>
                <Typo size={25} fontWeight={"800"}>Always Take Control </Typo>
                <Typo size={20} fontWeight={"500"}>Of Your Finances </Typo>
            </View>
        

        <View style={styles.buttonContainer}>
            <Button onPress={()=> {
                console.log("Navigating to register");
                router.push('/(auth)/register')}}>

                <Typo size={22} fontWeight={"500"} color={colors.neutral900}>Get Started</Typo>
            </Button>
        </View>

        </View>
            
       </View>
    </ScreenWrapper>
  )
}

export default Welcome;

const styles = StyleSheet.create({
    container : {
        flex : 1,
        justifyContent : "space-between",
        paddingTop : spacingY._7,
    },
    welcomeImage : {
        alignSelf : "center",
        width : "100%",
        height: verticalScale(200),
        marginTop: verticalScale(100),
    },
    loginButton : {
        alignSelf : "flex-end",
        marginRight : spacingX._20,
    },
    footer : {
        backgroundColor : colors.neutral900,
        alignItems : "center",
        paddingTop : verticalScale(30),
        paddingBottom : verticalScale(45),
        gap : spacingY._20,
        shadowColor : "white",
        shadowOffset : {width : 0, height : -10},
        elevation : 20,
        shadowRadius : 25,
        shadowOpacity : 0.2,
    },
    buttonContainer : {
        width : "100%",
        paddingHorizontal : spacingX._30,
        paddingVertical : spacingY._10,
    },
});