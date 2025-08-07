import { fireStore } from "@/config/firebase";
import { TransactionType, WalletType, ResponseType } from "@/types";
import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, setDoc, Timestamp, updateDoc, where } from "firebase/firestore";
import { uploadFileToCloudinary } from "./ImageServices";
import { createOrUpdateWallet } from "./WalletServices";
import { routingQueue } from "expo-router/build/global-state/routing";
import { router } from "expo-router";
import { getLast12Months, getLast7Days, getYearsRange } from "@/utils/common";
import { scale } from "@/utils/styling";
import { colors } from "@/constants/theme";


export const createOrUpdateTransaction = async(
    transactionData : Partial<TransactionType>
) : Promise<ResponseType> => {
     try{
        const {walletId, id, type, amount, image} = transactionData;
        if(!amount || amount <=0 || !walletId || !type){
            return {success : false, msg : "Invalid Transaction Data"};
        }

        if(id){
            //update wallet for exisiting transaction
            const oldTransactionSnapshot = await getDoc(
                doc(fireStore, "transactions", id)
            );
            const oldTransaction = oldTransactionSnapshot.data() as TransactionType;
            const shouldRevertOgi = oldTransaction.type != type || oldTransaction.amount != amount || oldTransaction.walletId != walletId;
            if(shouldRevertOgi){
                let res = await revertAndUpdateWallets(oldTransaction, Number(amount), type, walletId);
                if(!res.success) return res
            }
        }else{
            //update wallet for new transaction
            let res = await updateWalletForNewTransaction(
                walletId!,
                Number(amount!),
                type,
            );
            if(!res.success) return res
        }

         if(image){
                const imageUploadRes = await uploadFileToCloudinary(
                    image,
                    "transactions"
                );
                if(!imageUploadRes.success){
                    return{
                        success : false,
                        msg : imageUploadRes.msg || "Failed to upload receipt",
                    };
                }
                transactionData.image = imageUploadRes.data;
            }

            const transactionRef = id ? doc(fireStore, "transactions", id) : doc(collection(fireStore, "transactions"));
            await setDoc(transactionRef, transactionData, {merge : true});
    
        return {success : true, data : {...transactionData, id : transactionRef.id}}
      }catch(err:any){
        console.log('error creating or updating the transaction : ', err);
        return {success : false,msg : err.message}
      }
};

const updateWalletForNewTransaction = async(
    walletId : string,
    amount : number,
    type : string,
)=>{
    try{
        const walletRef = doc(fireStore, "wallets", walletId);
        const walletSnapshot = await getDoc(walletRef);
        if(!walletSnapshot.exists()){
            console.log('error creating or updating the transaction : ');
            return {success : false,msg : "Wallet not Found!"}
        }

        const walletData = walletSnapshot.data() as WalletType;

        if(type == "expense" && walletData.amount! - amount < 0){
            console.log('error creating or updating the transaction : ');
            return {success : false, msg : "Insufficient Balance!"}
        }

        const updateType = type == 'income' ? 'totalIncome' : 'totalExpenses';
        const updatedWalletAmount = type == 'income' ? Number(walletData.amount) + amount : Number(walletData.amount) - amount;

        const updatedTotals = type == 'income' ? Number(walletData.totalIncome) + amount :  Number(walletData.totalExpenses) + amount;

        await updateDoc(walletRef, {
            amount : updatedWalletAmount,
            [updateType] : updatedTotals,
        })
        return {success : true};
    }catch(err:any){
        console.log('error creating or updating the transaction : ', err);
        return {success : false,msg : err.message}
    }
    
};

const revertAndUpdateWallets = async(
    oldTransaction : TransactionType,
    newTransactionAmount : number,
    newTransactionType : string,
    newWalletId : string,
)=>{
    try{
        if (!oldTransaction.walletId) {
            throw new Error("Wallet ID is missing");
        }   
        const ogiWalletSnapshot = await getDoc((
            doc(fireStore, "wallets", oldTransaction.walletId))
        );
        
        const ogiWallet = ogiWalletSnapshot.data() as WalletType;

        let newWalletSnapshot = await getDoc((
            doc(fireStore, "wallets", newWalletId))
        );

        let newWallet = newWalletSnapshot.data() as WalletType;
        const revertType = oldTransaction.type == 'income' ? 'totalIncome' : 'totalExpenses';
        const revertIncomeExpenses : number = oldTransaction.type == 'income' ? -Number(oldTransaction.amount) : Number(oldTransaction.amount);
        const revertedWalletAmount = Number(ogiWallet.amount) + revertIncomeExpenses;
        const revertedIncomeExpensesAmount = Number(ogiWallet[revertType]) - Number(oldTransaction.amount);

        if(newTransactionType == 'expense'){
            if(oldTransaction.walletId == newWalletId && revertedWalletAmount < newTransactionAmount){
                return {success : false, msg : "Selected Wallet has Insufficient Balance"};
            }

             if(newWallet.amount! < newTransactionAmount){
                return {success : false, msg : "Selected Wallet has Insufficient Balance"};
            }
        }

        await createOrUpdateWallet({
            id : oldTransaction.walletId,
            amount : revertedWalletAmount,
            [revertType] : revertedIncomeExpensesAmount,
        });


        //refetching the newWallet because we may have updated it
        newWalletSnapshot =await  getDoc(doc(fireStore, "wallets", newWalletId));
        newWallet  = newWalletSnapshot.data() as WalletType;

        const updateType = newTransactionType == 'income' ? "totalIncome" : "totalExpenses";
        const updatedTransactionAmount : number  = newTransactionType == 'income' ? Number(newTransactionAmount) : -Number(newTransactionAmount);

        const newWalletAmount = Number(newWallet.amount) + updatedTransactionAmount;

        const newIncomeExpenseAmount = Number(newWallet[updateType]! + Number(newTransactionAmount));

        await createOrUpdateWallet({
            id : newWalletId,
            amount : newWalletAmount,
            [updateType] : newIncomeExpenseAmount,
        });

        return {success : true}
    }catch(err:any){
        console.log('error creating or updating the transaction : ', err);
        return {success : false,msg : err.message}
    }
    
};

export const deleteTransaction = async (
    transactionId : string,
    walletId: string
) =>{
    try{
        const transactionRef = doc(fireStore, "transactions", transactionId);
        const transactionSnapshot = await getDoc(transactionRef);

        if(!transactionSnapshot.exists()){
            return {success : false,msg : "transaction Not Found"};
        }

        const transactionData = transactionSnapshot.data() as TransactionType;

        const transactionType = transactionData?.type;
        const transactionAmount = transactionData?.amount;

        const walletSnapshot = await getDoc(doc(fireStore, "wallets", walletId));
        const walletData = walletSnapshot.data() as WalletType;

        const updateType = transactionType == 'income' ? 'totalIncome' : 'totalExpenses';

        if (typeof transactionAmount !== 'number') {
                    throw new Error("Transaction amount is required");
        }

        const newWalletAmount = walletData?.amount! - (transactionType == 'income' ? transactionAmount: -transactionAmount)

        const newIncomeExpenseAmount = walletData[updateType]! - transactionAmount;

// if its expense and the wallet amount can go below zero
        if (transactionType == "income" && newWalletAmount < 0) {
                return { success: false, msg: "You cannot delete this transaction" };
        }

        await createOrUpdateWallet({
            id: walletId,
            amount: newWalletAmount,
            [updateType]: newIncomeExpenseAmount,
        });

        await deleteDoc(transactionRef);
        {
            router.back()
        }
    }catch(err:any){
        console.log('error creating or updating the transaction : ', err);
        return {success : false,msg : err.message}
    }
};

export const fetchWeeklyStats = async (uid : string) : Promise<ResponseType> =>{
    try{
        const db = fireStore;
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        const transactionQuery = query(
            collection(db, 'transactions'),
            where('date', '>=', Timestamp.fromDate(sevenDaysAgo)),
            where('date', '<=', Timestamp.fromDate(today)),
            orderBy("date", 'desc'),
            where('uid','==', uid)
        );

        const querySnapshot = await getDocs(transactionQuery);
        const weeklyData = getLast7Days();
        const transactions : TransactionType[] = [];

        querySnapshot.forEach((doc)=>{
            const transaction = doc.data() as TransactionType;
            transaction.id = doc.id;
            transactions.push(transaction);

            const transactionDate = (transaction.date as Timestamp).toDate().toISOString().split("T")[0];

            const dayData = weeklyData.find((day)=> day.date == transactionDate);

            if(dayData){
                if(transaction.type == 'income'){
                    dayData.income += transaction.amount;
                }else if(transaction.type == 'expense'){
                    dayData.expense += transaction.amount
                }
            }
        });

        const stats = weeklyData.flatMap((day)=>[
            {
                value : day.income,
                label : day.day,
                spacing : scale(4),
                labelWidth : scale(30),
                fontColor : colors.primary
            },
            {
                value : day.expense, fontColor : colors.rose
            },
        ]);


        return {success : true , data : {
            stats, transactions
        },
    };
    }catch(err:any){
        console.log('error fetching weekly stats : ', err);
        return {success : false,msg : err.message}
    }
};

export const fetchMonthlyStats = async (uid : string) : Promise<ResponseType> =>{
    try{
        const db = fireStore;
        const today = new Date();
        const twelveMonthsAgo = new Date(today);
        twelveMonthsAgo.setMonth(today.getMonth() - 12);

        const transactionQuery = query(
            collection(db, 'transactions'),
            where('date', '>=', Timestamp.fromDate(twelveMonthsAgo)),
            where('date', '<=', Timestamp.fromDate(today)),
            orderBy("date", 'desc'),
            where('uid','==', uid)
        );

        const querySnapshot = await getDocs(transactionQuery);
        const MonthlyData = getLast12Months();
        const transactions : TransactionType[] = [];

        querySnapshot.forEach((doc)=>{
            const transaction = doc.data() as TransactionType;
            transaction.id = doc.id;
            transactions.push(transaction);

            const transactionDate = (transaction.date as Timestamp).toDate();
            const monthName = transactionDate.toLocaleString("default", {
                month : 'short',
            });
            const shortYear = transactionDate.getFullYear().toString().slice(-2);
            const monthData = MonthlyData.find((month : any)=> month.month === `${monthName}${shortYear}`);

            if(monthData){
                if(transaction.type == 'income'){
                    monthData.income += transaction.amount;
                }else if(transaction.type == 'expense'){
                    monthData.expense += transaction.amount
                }
            }
        });

        const stats = MonthlyData.flatMap((month : any)=>[
            {
                value : month.income,
                label : month.day,
                spacing : scale(4),
                labelWidth : scale(30),
                fontColor : colors.primary
            },
            {
                value : month.expense, fontColor : colors.rose
            },
        ]);


        return {success : true , data : {
            stats, transactions
        },
    };
    }catch(err:any){
        console.log('error fetching monthly stats : ', err);
        return {success : false,msg : err.message}
    }
};

export const fetchYearlyStats = async (uid : string) : Promise<ResponseType> =>{
    try{
        const db = fireStore;

        const transactionQuery = query(
            collection(db, 'transactions'),
            orderBy("date", 'desc'),
            where('uid','==', uid)
        );

        const querySnapshot = await getDocs(transactionQuery);
        const transactions : TransactionType[] = [];

        const firstTransaction = querySnapshot.docs.reduce((earliest, doc)=>{
            const transactionDate = doc.data().date.toDate();
            return transactionDate < earliest ? transactionDate : earliest;
        }, new Date());

        const firstYear = firstTransaction.getFullYear();
        const currentYear = new Date().getFullYear();

        const yearlyData = getYearsRange(firstYear, currentYear);

        querySnapshot.forEach((doc)=>{
            const transaction = doc.data() as TransactionType;
            transaction.id = doc.id;
            transactions.push(transaction);

            const transactionYear = (transaction.date as Timestamp).toDate().getFullYear();
            
            const yearData = yearlyData.find((item :any)=> item.year === transactionYear.toString());

            if(yearData){
                if(transaction.type == 'income'){
                    yearData.income += transaction.amount;
                }else if(transaction.type == 'expense'){
                    yearData.expense += transaction.amount
                }
            }
        });

        const stats = yearlyData.flatMap((year : any)=>[
            {
                value : year.income,
                label : year.year,
                spacing : scale(4),
                labelWidth : scale(35),
                fontColor : colors.primary
            },
            {
                value : year.expense, fontColor : colors.rose
            },
        ]);


        return {success : true , data : {
            stats, transactions
        },
    };
    }catch(err:any){
        console.log('error fetching monthly stats : ', err);
        return {success : false,msg : err.message}
    }
};