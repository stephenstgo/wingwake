import { FlightPageTemplate } from '@/components/flight-page-template';
import { flightData } from '@/lib/data/flight-data';

export default function TrainingFlightPage() {
  const data = flightData.training;
  return <FlightPageTemplate flightType="Training Flight" flightInfo={data.flightInfo} initialFiles={data.initialFiles} />;
}
