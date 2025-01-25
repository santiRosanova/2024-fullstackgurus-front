export const getFilteredData = (caloriesPerDay: Record<string, any>, startDate: Date, endDate: Date) => {
  
  return Object.keys(caloriesPerDay).map(key => {
      const [day, month] = caloriesPerDay[key].date.split('/').map(Number);
      const year = new Date().getFullYear(); 
      const entryDate = new Date(year, month - 1, day);
      return { ...caloriesPerDay[key], entryDate };
    })
    .filter(item => item.entryDate >= startDate && item.entryDate <= endDate)
    .map(({ entryDate, ...rest }) => rest)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};