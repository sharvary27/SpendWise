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
import { UserDataType, WalletType } from '@/types';
import Button from '@/components/Button';
import { useAuth } from '@/contexts/authContext';
import { updateUser } from '@/services/UserServices';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import ImageUpload from '@/components/imageUpload';
import { createOrUpdateWallet, deleteWallet } from '@/services/WalletServices';



const WalletModal = () => {
    const {user, updateUserData} = useAuth();
    const router = useRouter();
    const [wallet,  setWallet] = useState<WalletType>({
        name : "",
        image : null,
    });
    const [loading, setLoading] = useState(false);

    const oldWallet : { name : string; image:string; id:string } = useLocalSearchParams();

    useEffect(()=>{
      if(oldWallet?.id){
        setWallet({
          name : oldWallet?.name,
          image : oldWallet?.image,
        });
      }
    }, []);

    const onSubmit = async()=>{
        let {name, image} = wallet;
        if(!name.trim() || !image){
            Alert.alert("Please fill all the fields");
            return;
        }

        const data : WalletType = {
            name,
            image,
            uid : user?.uid
        };
        if(oldWallet?.id) data.id = oldWallet?.id;
        setLoading(true);
        const res = await createOrUpdateWallet(data);
        setLoading(false);
        if (res.success) {
    // success case
            router.back();
        } else {
            Alert.alert("wallet", res.msg);
        }
    };
    const onDelete = async()=>{
      if(!oldWallet?.id)return;
      setLoading(true);
      const res = await deleteWallet(oldWallet?.id);
      setLoading(false);
      if(res.success){
        router.back();
      }else{
        Alert.alert("Wallet", res.msg);
      }
    };
    const showDeletAlert = ()=>{
      Alert.alert(
        "Confirm", "Are you sure?",
        [
          {
            text : "Cancel",
            onPress : ()=> console.log("cancel delete"),
            style : 'cancel'
          },
          {
            text : "Delete",
            onPress : ()=> onDelete(),
            style : 'destructive'
          }
        ]
      );
    }
  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header
          title={oldWallet?.id ? "Update Wallet" : "New Wallet"}
          leftIcon={<BackButton />}
          style={{ marginBottom: spacingY._5 , alignSelf: 'center'}}
          
        />

        {/* form */}
        <ScrollView contentContainerStyle={styles.form}>
          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200}>Wallet Name</Typo>
            <Input
              placeholder="Salary"
              value={wallet.name}
              onChangeText={(value) => setWallet({...wallet, name : value})}
            />
          </View>
           <View style={styles.inputContainer}>
            <Typo color={colors.neutral200}>Wallet Icon</Typo>

             <ImageUpload 
             file={wallet.image} 
             onClear = {()=> setWallet({...wallet, image: null})}
             onSelect={(file) =>setWallet({...wallet, image: file})}
             placeholder="Upload Image"
             />

          </View>
        </ScrollView>
      </View >

      <View style={styles.footer}>
        {
          oldWallet?.id && !loading &&  (
            <Button
              onPress={showDeletAlert}
              style={{
                backgroundColor : colors.rose,
                paddingHorizontal  :spacingX._15,
              }}
            >
              <Icons.Trash
                color={colors.white}
                size={verticalScale(24)}
                weight='bold'
              />
            </Button>
          )
        }
            <Button onPress ={onSubmit} style={{flex : 1}}>
                <Typo color={colors.black} fontWeight={"700"} >
                    {
                      oldWallet?.id ? "Update Wallet" : "Add Wallet"
                    }
                </Typo>
            </Button>
      </View>
    </ModalWrapper>
  );
};


export default WalletModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    // alignItems : 'center',
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
