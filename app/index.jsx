import { View } from 'react-native'
import Loading from '../components/Loading';

const index = () => {
  return (
   <View style={{flex:1, alignItems:'center', justifyContent:'center', backgroundColor: 'white'}}>
      <Loading />
   </View>
  )
}
export default index