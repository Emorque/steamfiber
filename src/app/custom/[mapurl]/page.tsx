import { createClient } from '@/utils/supabase/server';

export default async function Countries({params} : {params : Promise<{mapurl : string}>}) {
  const supabase = await createClient();
  const { data: customMap } = await supabase.from("customMaps").select('steamProfile, friendsPositions, steamNames, addedNames').eq('link', (await params).mapurl);

  if (customMap){
      return <pre>{JSON.stringify(customMap, null, 2)}</pre>
  }  
}