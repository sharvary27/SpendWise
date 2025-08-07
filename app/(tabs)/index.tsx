import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { auth } from '@/config/firebase';
import Button from '@/components/Button';
import Typo from '@/components/typo';
import { colors, spacingX, spacingY } from '@/constants/theme';
import { signOut } from 'firebase/auth';
import ScreenWrapper from '@/components/ScreenWrapper';
import { verticalScale } from '@/utils/styling';
import { useAuth } from '@/contexts/authContext';
import * as Icons from 'phosphor-react-native';
import HomeCard from '@/components/HomeCard';
import TransactionList from '@/components/TransactionList';
import { useRouter } from 'expo-router';
import { Dropdown } from 'react-native-element-dropdown';
import { limit, orderBy, where } from 'firebase/firestore';
import useFetchData from '@/hooks/useFetchData';
import { TransactionType, WalletType } from '@/types';


const Home = () => {
  const {user} = useAuth();
  const router = useRouter();

  const constraints = [
    where("uid", "==", user?.uid),
    orderBy("date","desc" ),
    limit(30)
  ];

   const {data : recentTransactions, error, loading : transactionLoading} = useFetchData<TransactionType>("transactions", constraints);

  return (
    <ScreenWrapper>
      <View style={styles.container}>

        <View style={styles.header}>
          <View style={{gap : 4}}>
            <Typo size={16} color={colors.neutral400}> 
              Hello,
            </Typo>
            <Typo fontWeight={"500"} size={20}>
              {user?.name}
            </Typo>
          </View>
          <TouchableOpacity style={styles.searchIcon} onPress={()=> router.push("./(modals)/searchModal")}>
            <Icons.MagnifyingGlass
              size={verticalScale(22)}
              color={colors.neutral200}
              weight='bold'
            />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle = {styles.scrollViewStyle} showsVerticalScrollIndicator= {false}>
            <View>
              <HomeCard/>
            </View>

            <TransactionList loading={transactionLoading} data={recentTransactions} title="Recent Transactions" emptyListMessage='No Transaction has been Added yet!'/>
        </ScrollView>

       <Button style={styles.floatingButton} onPress={() => router.push("./(modals)/transactionModal")}>
                <Icons.Plus
                    color={colors.black}
                    weight='bold'
                    size={verticalScale(24)}
                />
        </Button>
      </View>    
    </ScreenWrapper>
  )
}

export default Home;

  const styles = StyleSheet.create({
  container :{
    flex : 1,
    paddingHorizontal : spacingX._20,
    marginTop: verticalScale(8),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._10,
  },
  searchIcon: {
    backgroundColor: colors.neutral700,
    padding: spacingX._10,
    borderRadius: 50,
  },
  floatingButton: {
    height: verticalScale(50),
    width: verticalScale(50),
    borderRadius: 100,
    position: "absolute",
    bottom: verticalScale(30),
    right: verticalScale(30),
  },
  scrollViewStyle: {
    marginTop: spacingY._10,
    paddingBottom: verticalScale(100),
    gap: spacingX._25,
  },
});
