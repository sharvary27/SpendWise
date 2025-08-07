import { StyleSheet, Text, TouchableOpacity, View, Alert} from 'react-native'
import React from 'react'
import ScreenWrapper from '@/components/ScreenWrapper'
import { colors, spacingX, spacingY, radius } from '@/constants/theme'
import { verticalScale } from '@/utils/styling'
import Header from '@/components/Header'
import Typo from '@/components/typo'
import { useAuth } from '@/contexts/authContext'
import { Image } from 'expo-image'
import { getProfileImage } from '@/services/ImageServices'
import { accountOptionType } from '@/types'
import * as Icons from 'phosphor-react-native'
import { auth } from '@/config/firebase'
import { signOut } from 'firebase/auth'
import { useRouter } from 'expo-router'



const Profile = () => {
  const {user} = useAuth();
  const router = useRouter();

  const accountOptions : accountOptionType[] =[
    {
      title : "Edit Profile",
      icon : <Icons.User size={26} color={colors.white} weight='fill'/>,
      routeName : "/(modals)/profileModal",
      bgColor : '#6366f1',
    },
    {
      title : "Settings",
      icon : <Icons.User size={26} color={colors.white} weight='fill'/>,
      bgColor : "#59669",
    },
    {
      title : "Privacy Policy",
      icon : <Icons.User size={26} color={colors.white} weight='fill'/>,
      bgColor : colors.neutral600,
    },
    {
      title : "Logout",
      icon : <Icons.User size={26} color={colors.white} weight='fill'/>,
      bgColor : "#e11d48",
    },
  ];

const handleLogout = async () => {
        await signOut(auth);
    };
const showLogoutAlert = () => {
    Alert.alert("Confirm", "Are you sure you want to logout?", [
    {
      text: "Cancel",
      onPress: () => console.log("cancel logout"),
      style: "cancel",
    },
    {
      text: "Logout",
      onPress: () => handleLogout(),
      style: "destructive",
    },
  ]);
};

const handlePress = ( item : accountOptionType) =>{
      if(item.title == "Logout"){
        showLogoutAlert();
      }

      if(item.routeName) router.push(item.routeName);
};
  return (
    <ScreenWrapper>
      <View style={styles.container}>
                <Header title="Profile" style = {{marginVertical : spacingY._10}}/>

                {/* userinfo */}
                <View style={styles.userInfo}>
                    {/* avatar */}
                    <View>
                      <Image source={getProfileImage(user?.image)} style={styles.avatar} contentFit='cover' transition={100}/>
                    </View>
                    {/* name and email */}
                    <View style={styles.nameContainer}>
                        <Typo size={24} fontWeight={600} color={colors.neutral100}>
                          {user?.name}
                        </Typo>

                        <Typo size={15} color={colors.neutral400}>
                          {user?.email}
                        </Typo>
                    </View>
                </View>

                <View style = {styles.accountOptions}>
                    {accountOptions.map((item, index)=>{
                      return(

                        <View key={index.toString()} style={styles.listItem}>
                          
                          <TouchableOpacity onPress={() => handlePress(item)} style={styles.flexRow}>
                            <View style={[styles.listIcon , {backgroundColor : item?.bgColor},
                            ] }>
                                {item.icon && item.icon}
                            </View>
                            <Typo size={16} fontWeight={"500"} style={{flex : 1}}>
                              {item.title}
                            </Typo>
                            <Icons.CaretRight
                             size={verticalScale(20)}
                             weight='bold'
                             color={colors.white}
                            />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                </View>
      </View>   
    </ScreenWrapper>
  )
}

export default Profile

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._10,
  },
  userInfo: {
    marginTop: verticalScale(30),
    alignItems: "center",
    gap: spacingY._15,
  },
  avatarContainer: {
    position: "relative",
    alignSelf: "center",
  },
  avatar: {
    alignSelf: "center",
    backgroundColor: colors.neutral300,
    height: verticalScale(135),
    width: verticalScale(135),
    borderRadius: 200,
    overflow: "hidden",
    position: "relative",
  },
  editIcon: {
    position: "absolute",
    bottom: 5,
    right: 8,
    borderRadius: 50,
    backgroundColor: colors.neutral100,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    padding: 5,
  },
  nameContainer: {
    gap: verticalScale(4),
    alignItems: "center",
  },
  listIcon: {
    height: verticalScale(44),
    width: verticalScale(44),
    backgroundColor: colors.neutral500,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius._15,
    borderCurve: "continuous",
  },
  listItem: {
    marginBottom: verticalScale(17),
  },
  accountOptions: {
    marginTop: spacingY._35,
  },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
  },
});
