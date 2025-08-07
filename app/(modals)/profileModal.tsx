import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { scale, verticalScale } from '@/utils/styling';
import ScreenWrapper from '@/components/ScreenWrapper';
import ModalWrapper from '@/components/ModalWrapper';
import Header from '@/components/Header';
import BackButton from '@/components/BackButton';
import { TouchableOpacity } from 'react-native';
import Typo from '@/components/typo';
import Input from '@/components/Input';
import * as Icons from 'phosphor-react-native';
import { getProfileImage } from '@/services/ImageServices';
import { Image } from 'expo-image';
import { UserDataType } from '@/types';
import Button from '@/components/Button';
import { useAuth } from '@/contexts/authContext';
import { updateUser } from '@/services/UserServices';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker'


const ProfileModal = () => {
    const {user, updateUserData} = useAuth();
    const router = useRouter();
    const [userData,  setUserData] = useState<UserDataType>({
        name : "",
        image : null,
    });
    const [loading, setLoading] = useState(false);

    useEffect(()=>{
        setUserData({
            name : user?.name || "",
            image : user?.image || null,
        });
    }, [user]);

    const onPickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        });

        console.log(result);

        if (!result.canceled) {
            setUserData({...userData , image: result.assets[0]});
        }
    };

    const onSubmit = async()=>{
        let {name, image} = userData;
        if(!name.trim()){
            Alert.alert("Please fill all the fields");
            return;
        }

        setLoading(true);
        const res = await updateUser(user?.uid as string, userData);
        setLoading(false);
        if (res.success) {
    // success case
            updateUserData(user?.uid as string);
            router.back();
        } else {
            Alert.alert("User", res.msg);
        }
    };
  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header
          title="Update Profile"
          leftIcon={<BackButton />}
          style={{ marginBottom: spacingY._5 , alignSelf: "center"}}
          
        />

        {/* form */}
        <ScrollView contentContainerStyle={styles.form}>
          <View style={styles.avatarContainer}>
            <Image
              style={styles.avatar}
              source ={getProfileImage(userData.image)}
              contentFit="cover"
              transition={100}
            />

            <TouchableOpacity onPress={onPickImage} style={styles.editIcon}>
              <Icons.Pencil
                size={verticalScale(20)}
                color={colors.neutral800}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200}>Name</Typo>
            <Input
              placeholder="Name"
              value={userData.name}
              onChangeText={(value) => setUserData({...userData, name : value})}
            />
          </View>
        </ScrollView>
      </View >

      <View style={styles.footer}>
            <Button onPress ={onSubmit} style={{flex : 1}}>
                <Typo color={colors.black} fontWeight={"700"} >
                    Update
                </Typo>
            </Button>
      </View>
    </ModalWrapper>
  );
};


export default ProfileModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._10,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: spacingX._20,
    gap: scale(12),
    paddingTop: spacingY._15,
    borderTopColor: colors.neutral700,
    marginBottom: spacingY._5,
    borderTopWidth : 1,
  },
  avatar: {
  alignSelf: "center",
  backgroundColor: colors.primary,
  height: verticalScale(135),
  width: verticalScale(135),
  borderRadius: verticalScale(135) / 2,
  borderWidth: 1,
  borderColor: colors.neutral500,
  overflow: "hidden",
  position: "relative",
},

editIcon: {
  position: "absolute",
  bottom: 0,
  right: 0,
  borderRadius: 10,
  backgroundColor: colors.neutral100,
  shadowColor: colors.black,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.25,
  shadowRadius: 10,
  elevation: 4,
  padding: spacingY._7,
},

inputContainer: {
  gap: spacingY._10,
},
form: {
  gap: spacingY._5,
  marginTop: spacingY._10,
},

avatarContainer: {
  width: verticalScale(135), 
  height: verticalScale(135), 
  alignSelf: "center",
  position: "relative", 
},
});
