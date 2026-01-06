import { FlightPageTemplate } from '@/components/flight-page-template';
import { flightData } from '@/lib/data/flight-data';

export default function WeighingFlightPage() {
  const data = flightData.weighing;
  return <FlightPageTemplate flightType="Weighing Flight" flightInfo={data.flightInfo} initialFiles={data.initialFiles} />;
}
