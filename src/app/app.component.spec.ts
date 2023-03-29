import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';


describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [
        HttpClientTestingModule, 
        RouterTestingModule.withRoutes([]),
        FormsModule,
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });


  afterEach(() => {
    httpMock.verify();
  });


  it('should create the app', () => {
    expect(component).toBeTruthy();
  });
  

  describe('onSubmit', () => {
    it('should call the weather API if a valid city is entered', fakeAsync(() => {
      const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=Paris&limit=5&appid=26aebd88d7be24240cd023de03361295`;
      const weatherData = { name: 'Paris', main: { temp: 12.34, feels_like: 15.67, temp_min: 10.98, temp_max: 13.45 }, weather: [{ description: 'Clear' }] };

      component.name = 'Paris';
      component.onSubmit();

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toEqual('GET');

      req.flush([{
        name: 'Paris',
        country: 'FR',
        lat: 48.8534,
        lon: 2.3488,
      }]);

      tick();

      expect(component.countries).toBeFalsy();
      expect(component.selectedCountry).toEqual({
        name: 'Paris',
        country: 'FR',
        lat: 48.8534,
        lon: 2.3488,
      });
      expect(localStorage.getItem('selectedCity')).toEqual('Paris');

      const weatherReq = httpMock.expectOne(`https://api.openweathermap.org/data/2.5/weather?lat=48.8534&lon=2.3488&units=metric&appid=26aebd88d7be24240cd023de03361295`);
      expect(weatherReq.request.method).toEqual('GET');

      weatherReq.flush(weatherData);

      tick();

      expect(component.weatherData).toEqual(weatherData);
      httpMock.verify()
    }));

    it('should display an error if an invalid city is entered', fakeAsync(() => {
      const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=InvalidCity&limit=5&appid=26aebd88d7be24240cd023de03361295`;
    
      component.name = 'InvalidCity';
      component.onSubmit();
    
      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toEqual('GET');
    
      req.flush([]);
    
      tick();
    
      expect(component.countries).toEqual([]);
      expect(component.selectedCountry).toBeFalsy();
      expect(localStorage.getItem('selectedCity')).toBeFalsy();
      expect(component.weatherData.error).toEqual('City not found!');
      httpMock.verify();
    }));
    
  });

  describe('onSelectCountry', () => {
    it('should fetch weather data for the selected country', fakeAsync(() => {
      const country = { name: 'Paris', country: 'FR', lat: 48.8534, lon: 2.3488 };
      const weatherData = { name: 'Paris', main: { temp: 12.34, feels_like: 15.67, temp_min: 10.98, temp_max: 13.45 }, weather: [{ description: 'Clear' }] };
  
      component.onSelectCountry(country);
  
      const req = httpMock.expectOne(`https://api.openweathermap.org/data/2.5/weather?lat=${country.lat}&lon=${country.lon}&units=metric&appid=26aebd88d7be24240cd023de03361295`);
      expect(req.request.method).toEqual('GET');
  
      req.flush(weatherData);
  
      tick();
  
      expect(component.weatherData).toEqual(weatherData);
    }));
  
    it('should not fetch weather data if no country is selected', () => {
      component.onSelectCountry(null);
  
      httpMock.expectNone(`https://api.openweathermap.org/data/2.5/weather`);
      httpMock.verify()
    });
  
  });
  
});