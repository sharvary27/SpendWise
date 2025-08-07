import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from './ScreenWrapper'
import { spacingX, spacingY } from '@/constants/theme'
import { HeaderProps } from '@/types'
import Typo from './typo'

const Header = ({title = "", leftIcon, style} : HeaderProps) => {
  return (
    <ScreenWrapper style={styles.container}>
        <View style={styles.leftIcon}>
          {leftIcon}
        </View>
        <Typo size={27} fontWeight="600" style={{ textAlign: "center", width: leftIcon ? "80%" : "100%",
    }}
  >
    {title}
  </Typo>


</ScreenWrapper>
  )
};

export default Header

const styles = StyleSheet.create({
    container :{
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        // justifyContent : "center",
        // paddingHorizontal: spacingX._10,
        // paddingVertical: spacingY._10,
    },
    
    leftIcon : {
            alignSelf : "flex-start",
    },
    
});