import { FlightPageTemplate } from '@/components/flight-page-template';
import { flightData } from '@/lib/data/flight-data';

export default function DemoFlightPage() {
  const data = flightData.demo;
  return <FlightPageTemplate flightType="Demo Flight" flightInfo={data.flightInfo} initialFiles={data.initialFiles} />;
}
