import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'
import { BackButtonProps } from '@/types';
import { colors, radius } from '@/constants/theme';
import { CaretLeft } from 'phosphor-react-native';
import { verticalScale } from '@/utils/styling';

const BackButton = ({
  style, 
  iconSize = 24,
} : BackButtonProps) => {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={()=> router.back()} style = {[styles.button, style]}>
        <CaretLeft
          size={iconSize}
          color={colors.white}
          weight='bold'
        />
    </TouchableOpacity>
  )
}

export default BackButton

const styles = StyleSheet.create({
  button : {
    backgroundColor : colors.neutral600,
    padding : 10,
    alignSelf : "flex-start",
    borderRadius : radius._12,
    borderCurve : "continuous",
  }
})