import { StyleSheet, Text, View, ScrollView, Alert, Pressable, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import { colors, radius, spacingX, spacingY } from '@/constants/theme';
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
import { UserDataType, TransactionType, WalletType } from '@/types';
import Button from '@/components/Button';
import { useAuth } from '@/contexts/authContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ImageUpload from '@/components/imageUpload';
import { deleteWallet } from '@/services/WalletServices';
import { Dropdown } from 'react-native-element-dropdown';
import { expenseCategories, transactionTypes } from '@/constants/data';
import useFetchData from '@/hooks/useFetchData';
import { orderBy, where } from 'firebase/firestore';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { createOrUpdateTransaction, deleteTransaction } from '@/services/TransactionServices';


const TransactionModal = () => {
    const {user} = useAuth();
    const router = useRouter();
    const [transaction, setTransaction] = useState<TransactionType>({
        type : "expense",
        amount : 0,
        description : "",
        category : "",
        walletId : "",
        date : new Date(),
        image : null,
    });
    const [loading, setLoading] = useState(false);
    const [datePicker, setDatePicker] = useState(false);

     const {data : wallets, error : walletError, loading : walletLoading} = useFetchData<WalletType>("wallets", [
        where("uid", "==", user?.uid),
        orderBy("created", "desc"),

    ]);

    type paramType = {
        id: string,
        type : string,
        amount : string,
        category? : string,
        date : string,
        description? : string,
        image? : string,
        uid? : string,
        walletId : string,
    };
    const oldTransaction : paramType = useLocalSearchParams();

    const onDateChange = (event: any, selectedDate: any)=>{
      const currentDate = selectedDate || transaction.date;
      setTransaction({...transaction, date : currentDate}); 
        if (Platform.OS === 'android') {
           setDatePicker(false);
        }
    };

    useEffect(()=>{
      if(oldTransaction?.id){
        setTransaction({
          type : oldTransaction?.type,
          amount : Number(oldTransaction.amount),
          description : oldTransaction.description || "",
          category : oldTransaction.category || "",
          date : new Date(oldTransaction.date),
          walletId : oldTransaction.walletId,
          image : oldTransaction?.image,
        });
      }
    }, []);

    const onSubmit = async()=>{
       const {date, description, image, category, amount, type, walletId} = transaction;

       if(!walletId || !date || !amount || (type== 'expense' && !category)){
        Alert.alert("Transaction", "Please fill in all the details");
        return;
       }

       let transactionData : TransactionType = {
        type, 
        amount,
        description, 
        category, 
        date,
        walletId,
        image : image? image : null,
        uid : user?.uid,
       }

       if(oldTransaction?.id) transactionData.id = oldTransaction.id;
       setLoading(true);
       const res = await createOrUpdateTransaction(transactionData);
       setLoading(false);

       if(res.success){
        router.back();
       }else{
        Alert.alert("Transaction", res.msg)
       }
    };
    
    const onDelete = async()=>{
      if(!oldTransaction?.id)return;
      setLoading(true);
      const res = await deleteTransaction(oldTransaction?.id,oldTransaction.walletId);
      setLoading(false);
      if(res?.success){
        router.back();
      }else{
        Alert.alert("transaction", res?.msg);
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
    };

  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header
          title={oldTransaction?.id ? 'Update Transaction' : 'New Transaction'}
          leftIcon={<BackButton />}
          // style={{ marginBottom: spacingY._10 }}         
        />

        {/* form */}
        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>

          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200} size={14}>Type</Typo>
            {/* dropdown */}
            <Dropdown
                style={styles.dropdownContainer}
                activeColor={colors.neutral700}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownSelectedText}
                iconStyle={styles.dropdownIcon}
                data={transactionTypes}
                itemTextStyle = {styles.dropdownItemText}
                itemContainerStyle = {styles.dropdownItemContainer}
                containerStyle = {styles.dropdownListContainer}
                maxHeight={300}
                labelField="label"
                valueField="value"
                value={transaction.type}
                onChange={item => {
                    setTransaction({...transaction, type : item.value})
                }}
              />
          </View>

          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200}size={14}>Wallet</Typo>
            {/* wallet dropdown */}
            <Dropdown
                style={styles.dropdownContainer}
                activeColor={colors.neutral700}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownSelectedText}
                iconStyle={styles.dropdownIcon}
                data={wallets.map((wallet)=>({
                  label : ` ${wallet.name} ($${wallet.amount})`,
                  value : wallet?.id,
                }))}
                itemTextStyle = {styles.dropdownItemText}
                itemContainerStyle = {styles.dropdownItemContainer}
                containerStyle = {styles.dropdownListContainer}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={"Select Wallet"}
                value={transaction.walletId}
                onChange={item => {
                    setTransaction({...transaction, walletId : item.value || ""})
                }}
              />
           </View>

           {/* expense category */}
            {
              transaction.type == 'expense' && (
            
           <View style={styles.inputContainer}>
            <Typo color={colors.neutral200} size={14}>Expense</Typo>
            {/* wallet dropdown */}
            <Dropdown
                style={styles.dropdownContainer}
                activeColor={colors.neutral700}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownSelectedText}
                iconStyle={styles.dropdownIcon}
                data={Object.values(expenseCategories)}
                itemTextStyle = {styles.dropdownItemText}
                itemContainerStyle = {styles.dropdownItemContainer}
                containerStyle = {styles.dropdownListContainer}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={"Select Category"}
                value={transaction.category}
                onChange={item => {
                    setTransaction({...transaction, category : item.value || ""});
                }}
              />
           </View>
            )}

            {/* Date */}
            <View style={styles.inputContainer}>
            <Typo color={colors.neutral200} size={14}>Date</Typo>
            {
              !datePicker && (
                <Pressable
                  style = {styles.dateInput}
                  onPress={()=> setDatePicker(true)}
                >
                    <Typo size={14}>
                      {(transaction.date as Date).toLocaleDateString()}
                    </Typo>
                </Pressable>
              )
            }
            {
              datePicker && (
                <View>
                  <DateTimePicker
                    themeVariant='dark'
                    value={transaction.date as Date}
                    textColor={colors.white}
                    mode='date'
                    display = {Platform.OS == 'ios' ? "spinner" : "default"}
                    onChange ={onDateChange}
                  />

                  {Platform.OS === 'ios' && (
                    <TouchableOpacity style={styles.datePickerButton} onPress={()=>{setDatePicker(false)}}>
                      <Typo size={15} fontWeight={"500"}>
                        OK
                      </Typo>
                    </TouchableOpacity>
                  )
                  
                  }
                </View>
              )
            }
           </View>

           {/* amount */}
          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200} size={14}>Amount</Typo>
            <Input
              keyboardType='numeric'
              value={transaction.amount?.toString()}
              onChangeText={(value) => setTransaction({...transaction, amount : Number(value.replace(/[^0-9]/g, "")),
              })}
            />
          </View>

              {/* description */}
           <View style={styles.inputContainer}>
            <View style={styles.flexRow}>
              <Typo size={14} color={colors.neutral200}>Description</Typo>
              <Typo size={14} color={colors.neutral500}>(optional)</Typo>
            </View>           
            <Input
              value={transaction.description}
              multiline
              containerStyle={{
                flexDirection : "row",
                height : verticalScale(100),
                alignItems  :"flex-start",
                paddingVertical : 15,
              }}
              onChangeText={(value) => setTransaction({...transaction, description : value,
              })}
            />
          </View>


            {/* Image */}
           <View style={styles.inputContainer}>
            <View>
              <Typo color={colors.neutral200} size={14}>Receipt</Typo>
              <Typo color={colors.neutral500}>(optional)</Typo>
            </View>
             <ImageUpload 
             file={transaction.image} 
             onClear = {()=> setTransaction({...transaction, image: null})}
             onSelect={(file) =>setTransaction({...transaction, image: file})}
             placeholder="Upload Image"
             />
          </View>

        </ScrollView>
      </View >

      <View style={styles.footer}>
        {
          oldTransaction?.id && !loading &&  (
            <Button
              onPress={showDeletAlert}
              style={{
                backgroundColor : colors.rose,
                paddingHorizontal :spacingX._15,
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
            <Button loading={loading} onPress ={onSubmit} style={{flex : 1}}>
                <Typo color={colors.black} fontWeight={"700"} >
                    {
                      oldTransaction?.id ? "Update" : "Submit"
                    }
                </Typo>
            </Button>
      </View>
    </ModalWrapper>
  );
};


export default TransactionModal;

const styles = StyleSheet.create({
container: {
  flex: 1,
  paddingHorizontal: spacingX._20,
},

form: {
  gap: spacingY._20,
  paddingVertical: spacingY._15,
  paddingBottom: spacingY._40,
},
inputContainer: {
  gap: spacingY._10,
},
footer: {
  alignItems: "center",
  flexDirection: "row",
  justifyContent: "center",
  paddingHorizontal: spacingX._20,
  gap: scale(12),
  paddingTop : spacingY._15,
  borderTopColor : colors.neutral700,
  marginBottom : spacingY._5,
  borderTopWidth : 1,
},
dropdownContainer: {
  height: verticalScale(54),
  borderWidth: 1,
  borderColor: colors.neutral300,
  paddingHorizontal: spacingX._15,
  borderRadius: radius._15,
  borderCurve: "continuous",
},

dropdownItemText: { color: colors.white },

dropdownSelectedText: {
  color: colors.white,
  fontSize: verticalScale(14),
},

dropdownListContainer: {
  backgroundColor: colors.neutral900,
  borderRadius: radius._15,
  borderCurve: "continuous",
  paddingVertical: spacingY._7,
  top: 5,
  borderColor: colors.neutral500,
  shadowColor: colors.black,
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 1,
  shadowRadius: 15,
  elevation: 5,
},

dropdownPlaceholder: {
  color: colors.white,
},

dropdownItemContainer: {
  borderRadius: radius._15,
  marginHorizontal: spacingX._7,
},

dropdownIcon: {
  height: verticalScale(30),
  tintColor: colors.neutral300,
},
flexRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: spacingX._5,
},

dateInput: {
  flexDirection: "row",
  height: verticalScale(54),
  alignItems: "center",
  borderWidth: 1,
  borderColor: colors.neutral300,
  borderRadius: radius._17,
  paddingHorizontal: spacingX._15,
},
datePickerButton :{
  backgroundColor : colors.neutral700,
  alignSelf : "flex-end",
  padding : spacingY._7,
  marginRight : spacingX._7,
  paddingHorizontal : spacingY._15,
  borderRadius : radius._10,
}

});
