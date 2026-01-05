-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'driver', 'passenger');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create vehicles table for drivers
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  car_model TEXT NOT NULL,
  car_color TEXT NOT NULL,
  plate_number TEXT NOT NULL,
  year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create driver status enum
CREATE TYPE public.driver_status AS ENUM ('online', 'offline', 'busy');

-- Create driver_profiles table
CREATE TABLE public.driver_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  license_number TEXT,
  status driver_status NOT NULL DEFAULT 'offline',
  rating DECIMAL(2,1) DEFAULT 5.0,
  total_rides INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ride status enum
CREATE TYPE public.ride_status AS ENUM ('pending', 'accepted', 'in_progress', 'completed', 'cancelled');

-- Create rides table
CREATE TABLE public.rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  pickup_location TEXT NOT NULL,
  dropoff_location TEXT NOT NULL,
  pickup_lat DECIMAL(10,7),
  pickup_lng DECIMAL(10,7),
  dropoff_lat DECIMAL(10,7),
  dropoff_lng DECIMAL(10,7),
  status ride_status NOT NULL DEFAULT 'pending',
  fare DECIMAL(10,2),
  distance_km DECIMAL(10,2),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ratings table
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL UNIQUE REFERENCES public.rides(id) ON DELETE CASCADE,
  passenger_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Vehicles policies
CREATE POLICY "Drivers can manage own vehicles" ON public.vehicles
  FOR ALL USING (auth.uid() = driver_id);

CREATE POLICY "Anyone can view vehicles" ON public.vehicles
  FOR SELECT USING (true);

-- Driver profiles policies
CREATE POLICY "Drivers can manage own driver profile" ON public.driver_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view approved driver profiles" ON public.driver_profiles
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Admins can manage all driver profiles" ON public.driver_profiles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Rides policies
CREATE POLICY "Passengers can view own rides" ON public.rides
  FOR SELECT USING (auth.uid() = passenger_id);

CREATE POLICY "Drivers can view assigned rides" ON public.rides
  FOR SELECT USING (auth.uid() = driver_id);

CREATE POLICY "Drivers can view pending rides" ON public.rides
  FOR SELECT USING (
    public.has_role(auth.uid(), 'driver') AND status = 'pending'
  );

CREATE POLICY "Passengers can create rides" ON public.rides
  FOR INSERT WITH CHECK (auth.uid() = passenger_id);

CREATE POLICY "Drivers can update assigned rides" ON public.rides
  FOR UPDATE USING (auth.uid() = driver_id);

CREATE POLICY "Passengers can cancel own pending rides" ON public.rides
  FOR UPDATE USING (auth.uid() = passenger_id AND status = 'pending');

CREATE POLICY "Admins can manage all rides" ON public.rides
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Ratings policies
CREATE POLICY "Passengers can create ratings for completed rides" ON public.ratings
  FOR INSERT WITH CHECK (
    auth.uid() = passenger_id AND
    EXISTS (
      SELECT 1 FROM public.rides 
      WHERE id = ride_id AND passenger_id = auth.uid() AND status = 'completed'
    )
  );

CREATE POLICY "Anyone can view ratings" ON public.ratings
  FOR SELECT USING (true);

-- Trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_driver_profiles_updated_at
  BEFORE UPDATE ON public.driver_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rides_updated_at
  BEFORE UPDATE ON public.rides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile and role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', '')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'passenger')
  );
  
  -- If role is driver, create driver profile
  IF NEW.raw_user_meta_data ->> 'role' = 'driver' THEN
    INSERT INTO public.driver_profiles (user_id)
    VALUES (NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for rides
ALTER PUBLICATION supabase_realtime ADD TABLE public.rides;