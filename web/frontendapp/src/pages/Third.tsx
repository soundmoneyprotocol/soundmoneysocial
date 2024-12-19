import { FunctionComponent } from "react";
import FrameComponent from "../components/FrameComponent";

const Third: FunctionComponent = () => {
  return (
    <div className="w-full relative flex flex-row items-start justify-start py-[102px] px-[180px] box-border leading-[normal] tracking-[normal] mq450:pl-5 mq450:pr-5 mq450:box-border mq1050:pl-[90px] mq1050:pr-[90px] mq1050:box-border">
      <main className="flex-1 shadow-[0px_0px_1px_rgba(0,_0,_0,_0.8),_0px_2px_4px_-1px_rgba(0,_0,_0,_0.4),_0px_16px_24px_rgba(0,_0,_0,_0.8),_0px_8px_8px_-4px_rgba(0,_0,_0,_0.4)] rounded-21xl [background:linear-gradient(126.07deg,_#131313,_#070708)] border-gray-100 border-[1px] border-solid box-border flex flex-col items-start justify-start pt-[38px] pb-[130px] pl-[131px] pr-[49px] gap-8 max-w-full text-center text-17xl text-white font-montserrat lg:pl-[65px] lg:pr-6 lg:box-border mq450:pt-5 mq450:pb-[55px] mq450:box-border mq750:gap-4 mq750:pl-8 mq750:box-border mq1050:pt-[25px] mq1050:pb-[84px] mq1050:box-border">
        <div className="w-[1320px] h-[796px] relative shadow-[0px_0px_1px_rgba(0,_0,_0,_0.8),_0px_2px_4px_-1px_rgba(0,_0,_0,_0.4),_0px_16px_24px_rgba(0,_0,_0,_0.8),_0px_8px_8px_-4px_rgba(0,_0,_0,_0.4)] rounded-21xl [background:linear-gradient(126.07deg,_#131313,_#070708)] border-gray-100 border-[1px] border-solid box-border hidden max-w-full" />
        <div className="w-[1055px] flex flex-row items-start justify-center max-w-full">
          <div className="w-[499px] flex flex-col items-start justify-start gap-6 max-w-full">
            <h1 className="m-0 self-stretch relative text-inherit tracking-[-1px] leading-[48px] font-bold font-[inherit] z-[1] mq450:text-3xl mq450:leading-[29px] mq1050:text-10xl mq1050:leading-[38px]">
              Token Distribution
            </h1>
            <div className="relative text-[20px] tracking-[-0.4px] leading-[32px] font-medium text-gray-200 z-[1] mq450:text-base mq450:leading-[26px]">
              We’ve been very thoughtful about how our Token is created and
              distributed. Here is an overview:
            </div>
          </div>
        </div>
        <FrameComponent />
      </main>
    </div>
  );
};

export default Third;
