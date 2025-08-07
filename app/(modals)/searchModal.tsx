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
import { TransactionType, UserDataType, WalletType } from '@/types';
import Button from '@/components/Button';
import { useAuth } from '@/contexts/authContext';
import { updateUser } from '@/services/UserServices';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import ImageUpload from '@/components/imageUpload';
import { createOrUpdateWallet, deleteWallet } from '@/services/WalletServices';
import { limit, orderBy, where } from 'firebase/firestore';
import useFetchData from '@/hooks/useFetchData';
import TransactionList from '@/components/TransactionList';



const searchModal = () => {
    const {user, updateUserData} = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('')

    const constraints = [
    where("uid", "==", user?.uid),
    orderBy("date","desc" ),
    ];

   const {data : allTransactions, error, loading : transactionLoading} = useFetchData<TransactionType>("transactions", constraints);

    const filteredTransactions = allTransactions.filter((item)=>{
        if(search.length > 1){
            if(
                item.category?.toLowerCase()?.includes(search?.toLowerCase()) ||
                item.type?.toLowerCase()?.includes(search?.toLowerCase()) ||
                item.description?.toLowerCase()?.includes(search?.toLowerCase()) 
            ){
                return true;
            }
            return false;
        }return true;
    });
  return (
    <ModalWrapper style={{backgroundColor : colors.neutral900}}>
      <View style={styles.container}>
        <Header
          title={"Search"}
          leftIcon={<BackButton />}
          style={{ marginBottom: spacingY._5 , alignSelf: 'center'}}
          
        />

        {/* form */}
        <ScrollView contentContainerStyle={styles.form}>
          <View style={styles.inputContainer}>
            <Input
              placeholder="Shoes..."
              value={search}
              placeholderTextColor={colors.neutral400}
              containerStyle={{backgroundColor : colors.neutral800}}
              onChangeText={(value) => setSearch(value)}
            />
          </View>
          
          <View>
            <TransactionList
                loading = {transactionLoading}
                data = {filteredTransactions}
                emptyListMessage='No Transactions Found!'
            />
          </View>
        </ScrollView>
      </View >

    </ModalWrapper>
  );
};


export default searchModal;

const styles = StyleSheet.create({
container: {
    flex: 1,
    justifyContent: 'space-around',
    // alignItems : 'center',
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._10,
  },
inputContainer: {
  gap: spacingY._10,
},
form: {
  gap: spacingY._5,
  marginTop: spacingY._10,
},


});
