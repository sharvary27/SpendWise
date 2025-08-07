export const getLast7Days = () => {
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const res = [];

    for(let i = 6; i >= 0; i--){
        const date = new Date();
        date.setDate(date.getDate() - i);
        res.push({
            day : daysOfWeek[date.getDay()],
            date : date.toISOString().split('T')[0],
            income : 0,
            expense : 0,
        });
    }
    return res.reverse();
};

export const getLast12Months = ()=>{
    const monthsOfAYear = ['Jan', "Feb", 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const res = [];

     for(let i = 11; i >= 0; i--){
        const date = new Date();
        date.setMonth(date.getMonth() - i);

        const monthName = monthsOfAYear[date.getMonth()];
        const shortYear = date.getFullYear().toString().slice(-2);
        const formattedMonthYear = `${monthName} ${shortYear}`;
        const formattedDate = date.toISOString().split("T")[0];
        res.push({
            day : formattedMonthYear,
            date : formattedDate,
            income : 0,
            expense : 0,
        });
    }
    return res.reverse();
};

export const getYearsRange = (startYear : number, endYear : number): any=>{
    const res = [];

     for(let year = startYear; year <= endYear; year++){
        res.push({
            year : year.toString(),
            fullDate : `01-01-${year}`,
            income : 0,
            expense : 0,
        });
    }
    return res.reverse();
};