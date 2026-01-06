import { FlightPageTemplate } from '@/components/flight-page-template';
import { flightData } from '@/lib/data/flight-data';

export default function DeliveryFlightPage() {
  const data = flightData.delivery;
  return <FlightPageTemplate flightType="Delivery Flight" flightInfo={data.flightInfo} initialFiles={data.initialFiles} />;
}
