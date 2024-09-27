import { Fragment } from 'react';
import { SectionTitleBar } from '@/components/SectionTitleBar';

export interface IDetailSection {
    heading: string;
    content: string;
}
export const LOCATION_IFRAME_URL =
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3177.5064710178376!2d-93.29300142284976!3d37.211950144379166!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x87cf62fce4b64373%3A0xb83189288308d87f!2sefactory!5e0!3m2!1sen!2sus!4v1717465582324!5m2!1sen!2sus';

export function LocationBlock() {
    const details: IDetailSection[] = [
        {
            heading: 'Event Location',
            content:
                '<a target="_blank" href="https://maps.app.goo.gl/ZHNKbCreeTA3spxR9">405 N Jefferson Ave, Springfield, MO 65806</a>',
        },
        {
            heading: 'Airport',
            content:
                '<a target="_blank" href="https://maps.app.goo.gl/iZKBQPisPZMuZGit5">2300 N Airport Blvd, Springfield, MO 65802</a>',
        },
        {
            heading: 'Transportation',
            content:
                '<a target="_blank" href="https://www.uber.com/global/en/cities/springfield-mo/">Uber</a> <br>' +
                '<a target="_blank" href="https://www.lyft.com/rider/cities/springfield-mo">Lyft</a> <br>' +
                '<a target="_blank" href="https://www.facebook.com/pg/springfieldyellowcabcompany/about/?ref=page_internal">Yellow Cab</a> <br>' +
                '<a target="_blank" href="https://royaltaxispringfield.wixsite.com/royalservice">Royal Taxi</a>',
        },
        {
            heading: 'Nearby Hotels',
            content:
                '<a target="_blank" href="https://www.hilton.com/en/hotels/sgfmogi-hilton-garden-inn-springfield-mo/">Hilton Garden Inn</a> ' +
                '<a target="_blank" href="https://www.hotelvandivort.com/">Hotel Vandivort</a> <br>' +
                '<a target="_blank" href="https://www.marriott.com/hotels/travel/sgfts-towneplace-suites-springfield/">TownePlace Suites by Marriott Springfield</a> <br>' +
                '<a target="_blank" href="https://doubletree3.hilton.com/en/hotels/missouri/doubletree-by-hilton-hotel-springfield-SGFDTDT/index.html">DoubleTree by Hilton</a>',
        },
        {
            heading: 'Parking',
            content:
                '<p>There is free on-site parking at the event location.</p>',
        },
    ];

    return (
        <section id="location" className="mb-12 sm:mb-20">
            <SectionTitleBar title="Location Info" />

            <div className="content-container pt-12 sm:pt-20">
                <div className="flex flex-col lg:flex-row">
                    <div className="w-full lg:w-3/5 pb-8 lg:pb-0 lg:pr-8">
                        <iframe
                            className="w-full aspect-[670/400]"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            src={LOCATION_IFRAME_URL}
                        ></iframe>
                    </div>
                    <div className="w-full lg:w-2/5">
                        <dl>
                            {details.map(({ heading, content }) => (
                                <Fragment key={heading}>
                                    <dt className="font-bold text-3xl">
                                        {heading}
                                    </dt>
                                    <dd
                                        className="text-xl links mb-8 last:mb-0"
                                        dangerouslySetInnerHTML={{
                                            __html: content,
                                        }}
                                    ></dd>
                                </Fragment>
                            ))}
                        </dl>
                    </div>
                </div>
            </div>
        </section>
    );
}
