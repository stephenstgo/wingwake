import { FlightPageTemplate } from '@/components/flight-page-template';
import { flightData } from '@/lib/data/flight-data';

export default function RepositioningFlightPage() {
  const data = flightData.repositioning;
  return <FlightPageTemplate flightType="Repositioning Flight" flightInfo={data.flightInfo} initialFiles={data.initialFiles} />;
}
