import { FlightPageTemplate } from '@/components/flight-page-template';
import { flightData } from '@/lib/data/flight-data';

export default function InspectionFlightPage() {
  const data = flightData.inspection;
  return <FlightPageTemplate flightType="Inspection Flight" flightInfo={data.flightInfo} initialFiles={data.initialFiles} />;
}
