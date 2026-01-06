import { FlightPageTemplate } from '@/components/flight-page-template';
import { flightData } from '@/lib/data/flight-data';

export default function StorageFlightPage() {
  const data = flightData.storage;
  return <FlightPageTemplate flightType="Storage Flight" flightInfo={data.flightInfo} initialFiles={data.initialFiles} />;
}
